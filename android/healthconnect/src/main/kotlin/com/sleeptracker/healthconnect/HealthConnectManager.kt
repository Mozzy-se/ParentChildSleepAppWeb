package com.sleeptracker.healthconnect

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.activity.result.contract.ActivityResultContract
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.SleepSession
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.json.JSONArray
import org.json.JSONObject
import java.time.Instant
import java.time.temporal.ChronoUnit
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class HealthConnectManager(private val context: Context) {
    private val client by lazy { HealthConnectClient.getOrCreate(context) }
    private val httpClient = OkHttpClient()

    companion object {
        private const val HEALTH_CONNECT_PACKAGE = "com.google.android.apps.healthdata"
        private const val MIN_ANDROID_VERSION = Build.VERSION_CODES.O
        private val PERMISSIONS = setOf(
            HealthPermission.getReadPermission(SleepSession::class)
        )

        fun isSupported(): Boolean {
            return Build.VERSION.SDK_INT >= MIN_ANDROID_VERSION
        }
    }

    sealed class HealthConnectAvailability {
        object Available : HealthConnectAvailability()
        object NotInstalled : HealthConnectAvailability()
        object NotSupported : HealthConnectAvailability()
    }

    suspend fun checkAvailability(): HealthConnectAvailability {
        return when {
            !isSupported() -> HealthConnectAvailability.NotSupported
            !isProviderInstalled() -> HealthConnectAvailability.NotInstalled
            else -> HealthConnectAvailability.Available
        }
    }

    private fun isProviderInstalled(): Boolean {
        return try {
            context.packageManager.getPackageInfo(HEALTH_CONNECT_PACKAGE, 0)
            true
        } catch (e: PackageManager.NameNotFoundException) {
            false
        }
    }

    fun getPlayStoreIntent(): Intent {
        return Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("market://details?id=$HEALTH_CONNECT_PACKAGE")
            setPackage("com.android.vending")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    suspend fun requestPermissions(): Set<String> {
        return client.permissionController.getGrantedPermissions(PERMISSIONS)
    }

    suspend fun getSleepData(): Flow<String> = flow {
        try {
            val endTime = Instant.now()
            val startTime = endTime.minus(7, ChronoUnit.DAYS)

            val request = ReadRecordsRequest(
                recordType = SleepSession::class,
                timeRangeFilter = TimeRangeFilter.between(startTime, endTime)
            )

            val response = client.readRecords(request)
            val sleepData = JSONArray()

            response.records.forEach { session ->
                val sessionJson = JSONObject().apply {
                    put("startTime", session.startTime.toString())
                    put("endTime", session.endTime.toString())
                    put("title", session.title)
                    put("duration", ChronoUnit.MINUTES.between(session.startTime, session.endTime))
                    put("notes", session.notes ?: "")
                    
                    // Add sleep stages if available
                    val stages = JSONArray()
                    session.stages?.forEach { stage ->
                        stages.put(JSONObject().apply {
                            put("startTime", stage.startTime.toString())
                            put("endTime", stage.endTime.toString())
                            put("stage", stage.stage.toString())
                        })
                    }
                    put("stages", stages)
                }
                sleepData.put(sessionJson)
            }

            // Sync to backend
            syncToBackend(sleepData.toString())
            emit(sleepData.toString())
        } catch (e: Exception) {
            throw e
        }
    }

    private suspend fun syncToBackend(sleepData: String) {
        val url = "https://<our-domain>/api/sleep-data"
        val mediaType = "application/json; charset=utf-8".toMediaType()
        val body = sleepData.toRequestBody(mediaType)
        
        val request = Request.Builder()
            .url(url)
            .post(body)
            .header("Content-Type", "application/json")
            .build()

        httpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw Exception("Failed to sync data: ${response.code}")
            }
        }
    }
} 