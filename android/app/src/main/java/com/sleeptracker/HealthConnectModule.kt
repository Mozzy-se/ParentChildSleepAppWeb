package com.sleeptracker

import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.SleepRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.time.TimeRangeFilter
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.format.DateTimeFormatter

class HealthConnectModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val scope = CoroutineScope(Dispatchers.Main)
    private var healthConnectClient: HealthConnectClient? = null
    private val providerPackageName = "com.google.android.apps.healthdata"

    override fun getName() = "HealthConnectModule"

    @ReactMethod
    fun getSdkStatus(promise: Promise) {
        try {
            val availability = HealthConnectClient.getSdkStatus(reactApplicationContext, providerPackageName)
            when (availability) {
                HealthConnectClient.SDK_AVAILABLE -> promise.resolve("SDK_AVAILABLE")
                HealthConnectClient.SDK_UNAVAILABLE -> promise.resolve("SDK_UNAVAILABLE")
                HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED -> 
                    promise.resolve("SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED")
                else -> promise.reject("ERROR", "Unknown SDK status")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun openPlayStore(promise: Promise) {
        try {
            val uriString = "market://details?id=$providerPackageName&url=healthconnect%3A%2F%2Fonboarding"
            val intent = Intent(Intent.ACTION_VIEW).apply {
                setPackage("com.android.vending")
                data = Uri.parse(uriString)
                putExtra("overlay", true)
                putExtra("callerId", reactApplicationContext.packageName)
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun getGrantedPermissions(promise: Promise) {
        scope.launch {
            try {
                val client = getOrCreateClient() ?: throw Exception("Health Connect client not available")
                val granted = client.permissionController.getGrantedPermissions()
                val permissions = Arguments.createArray()
                granted.forEach { permissions.pushString(it) }
                promise.resolve(permissions)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun requestPermissions(permissions: ReadableArray, promise: Promise) {
        scope.launch {
            try {
                val client = getOrCreateClient() ?: throw Exception("Health Connect client not available")
                val permissionSet = mutableSetOf<String>()
                for (i in 0 until permissions.size()) {
                    permissionSet.add(permissions.getString(i))
                }
                val granted = client.permissionController.getGrantedPermissions()
                if (granted.containsAll(permissionSet)) {
                    promise.resolve(true)
                } else {
                    // Create the permission contract
                    val contract = client.permissionController.createRequestPermissionResultContract()
                    
                    // Launch the permission request
                    val activity = currentActivity ?: throw Exception("Activity not available")
                    val result = contract.createIntent(reactApplicationContext, permissionSet)
                    activity.startActivityForResult(result, 0)
                    
                    // The result will be handled in the activity
                    promise.resolve(true)
                }
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun readRecords(recordType: String, options: ReadableMap, promise: Promise) {
        scope.launch {
            try {
                val client = getOrCreateClient() ?: throw Exception("Health Connect client not available")
                
                val timeRangeFilter = options.getMap("timeRangeFilter")
                val startTime = Instant.parse(timeRangeFilter?.getString("startTime"))
                val endTime = Instant.parse(timeRangeFilter?.getString("endTime"))
                val timeRange = TimeRangeFilter.between(startTime, endTime)

                val records = when (recordType) {
                    "SleepRecord" -> {
                        val sleepRecords = client.readRecords(
                            ReadRecordsRequest(
                                recordType = SleepRecord::class,
                                timeRangeFilter = timeRange
                            )
                        )
                        convertSleepRecordsToWritableArray(sleepRecords)
                    }
                    "HeartRateRecord" -> {
                        val heartRateRecords = client.readRecords(
                            ReadRecordsRequest(
                                recordType = HeartRateRecord::class,
                                timeRangeFilter = timeRange
                            )
                        )
                        convertHeartRateRecordsToWritableArray(heartRateRecords)
                    }
                    "StepsRecord" -> {
                        val stepsRecords = client.readRecords(
                            ReadRecordsRequest(
                                recordType = StepsRecord::class,
                                timeRangeFilter = timeRange
                            )
                        )
                        convertStepsRecordsToWritableArray(stepsRecords)
                    }
                    "ExerciseSessionRecord" -> {
                        val exerciseRecords = client.readRecords(
                            ReadRecordsRequest(
                                recordType = ExerciseSessionRecord::class,
                                timeRangeFilter = timeRange
                            )
                        )
                        convertExerciseRecordsToWritableArray(exerciseRecords)
                    }
                    else -> throw Exception("Unsupported record type: $recordType")
                }
                
                promise.resolve(records)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    private fun getOrCreateClient(): HealthConnectClient? {
        if (healthConnectClient == null) {
            healthConnectClient = HealthConnectClient.getOrCreate(reactApplicationContext)
        }
        return healthConnectClient
    }

    private fun convertSleepRecordsToWritableArray(records: List<SleepRecord>): WritableArray {
        val array = Arguments.createArray()
        records.forEach { record ->
            val map = Arguments.createMap()
            map.putString("startTime", record.startTime.toString())
            map.putString("endTime", record.endTime.toString())
            
            val stages = Arguments.createArray()
            record.stages.forEach { stage ->
                val stageMap = Arguments.createMap()
                stageMap.putString("stage", stage.stage.toString())
                stageMap.putString("startTime", stage.startTime.toString())
                stageMap.putDouble("duration", stage.duration.toMillis().toDouble())
                stages.pushMap(stageMap)
            }
            map.putArray("stages", stages)
            
            array.pushMap(map)
        }
        return array
    }

    private fun convertHeartRateRecordsToWritableArray(records: List<HeartRateRecord>): WritableArray {
        val array = Arguments.createArray()
        records.forEach { record ->
            val map = Arguments.createMap()
            map.putString("time", record.time.toString())
            map.putInt("beatsPerMinute", record.samples[0].beatsPerMinute)
            map.putDouble("accuracy", 0.95) // Default accuracy
            
            val metadata = Arguments.createMap()
            metadata.putString("dataOrigin", record.metadata.dataOrigin.packageName)
            map.putMap("metadata", metadata)
            
            array.pushMap(map)
        }
        return array
    }

    private fun convertStepsRecordsToWritableArray(records: List<StepsRecord>): WritableArray {
        val array = Arguments.createArray()
        records.forEach { record ->
            val map = Arguments.createMap()
            map.putString("startTime", record.startTime.toString())
            map.putString("endTime", record.endTime.toString())
            map.putInt("count", record.count)
            
            val metadata = Arguments.createMap()
            metadata.putString("dataOrigin", record.metadata.dataOrigin.packageName)
            map.putMap("metadata", metadata)
            
            array.pushMap(map)
        }
        return array
    }

    private fun convertExerciseRecordsToWritableArray(records: List<ExerciseSessionRecord>): WritableArray {
        val array = Arguments.createArray()
        records.forEach { record ->
            val map = Arguments.createMap()
            map.putString("startTime", record.startTime.toString())
            map.putString("endTime", record.endTime.toString())
            map.putDouble("distance", record.distance?.inMeters ?: 0.0)
            
            val metadata = Arguments.createMap()
            metadata.putString("dataOrigin", record.metadata.dataOrigin.packageName)
            map.putMap("metadata", metadata)
            
            array.pushMap(map)
        }
        return array
    }
} 