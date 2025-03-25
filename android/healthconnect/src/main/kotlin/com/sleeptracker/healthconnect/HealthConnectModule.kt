package com.sleeptracker.healthconnect

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.collect

class HealthConnectModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val healthConnectManager by lazy { HealthConnectManager(reactContext) }
    private val scope = CoroutineScope(Dispatchers.Main)

    override fun getName() = "HealthConnectModule"

    @ReactMethod
    fun checkAvailability(promise: Promise) {
        scope.launch {
            try {
                when (healthConnectManager.checkAvailability()) {
                    is HealthConnectManager.HealthConnectAvailability.Available -> {
                        promise.resolve("AVAILABLE")
                    }
                    is HealthConnectManager.HealthConnectAvailability.NotInstalled -> {
                        promise.resolve("NOT_INSTALLED")
                    }
                    is HealthConnectManager.HealthConnectAvailability.NotSupported -> {
                        promise.resolve("NOT_SUPPORTED")
                    }
                }
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun openPlayStore(promise: Promise) {
        try {
            val intent = healthConnectManager.getPlayStoreIntent()
            currentActivity?.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestPermissions(promise: Promise) {
        scope.launch {
            try {
                val permissions = healthConnectManager.requestPermissions()
                val result = Arguments.createMap().apply {
                    putBoolean("granted", permissions.isNotEmpty())
                    putArray("permissions", Arguments.fromList(permissions.toList()))
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    @ReactMethod
    fun getSleepData(promise: Promise) {
        scope.launch {
            try {
                healthConnectManager.getSleepData().collect { data ->
                    val event = Arguments.createMap().apply {
                        putString("data", data)
                    }
                    sendEvent("onSleepDataReceived", event)
                }
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("ERROR", e.message)
            }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    override fun getConstants(): Map<String, Any> {
        return mapOf(
            "AVAILABILITY_STATUS" to mapOf(
                "AVAILABLE" to "AVAILABLE",
                "NOT_INSTALLED" to "NOT_INSTALLED",
                "NOT_SUPPORTED" to "NOT_SUPPORTED"
            )
        )
    }
} 