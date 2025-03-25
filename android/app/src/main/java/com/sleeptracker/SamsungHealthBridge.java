package com.sleeptracker;

import android.content.Context;
import android.webkit.JavascriptInterface;
import com.samsung.android.sdk.healthdata.HealthConnectionErrorResult;
import com.samsung.android.sdk.healthdata.HealthConstants;
import com.samsung.android.sdk.healthdata.HealthDataStore;
import com.samsung.android.sdk.healthdata.HealthPermissionManager;
import com.samsung.android.sdk.healthdata.HealthDataResolver;
import com.samsung.android.sdk.healthdata.HealthResultHolder;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.HashSet;
import java.util.Set;

public class SamsungHealthBridge {
    private final Context context;
    private HealthDataStore healthDataStore;
    private boolean isInitialized = false;
    private boolean isConnected = false;

    public SamsungHealthBridge(Context context) {
        this.context = context;
        initializeHealthSDK();
    }

    private void initializeHealthSDK() {
        healthDataStore = new HealthDataStore(context, connectionListener);
    }

    private final HealthDataStore.ConnectionListener connectionListener = new HealthDataStore.ConnectionListener() {
        @Override
        public void onConnected() {
            isConnected = true;
            // You might want to notify the web app here
        }

        @Override
        public void onConnectionFailed(HealthConnectionErrorResult error) {
            isConnected = false;
            // Handle connection error
        }

        @Override
        public void onDisconnected() {
            isConnected = false;
        }
    };

    @JavascriptInterface
    public boolean initialize() {
        if (!isInitialized) {
            healthDataStore.connectService();
            isInitialized = true;
        }
        return isInitialized;
    }

    @JavascriptInterface
    public String requestPermissions(String[] permissions) {
        try {
            Set<HealthPermissionManager.PermissionKey> permissionKeys = new HashSet<>();
            
            // Add required permissions
            permissionKeys.add(new HealthPermissionManager.PermissionKey(
                HealthConstants.Sleep.HEALTH_DATA_TYPE, HealthPermissionManager.PermissionType.READ));
            permissionKeys.add(new HealthPermissionManager.PermissionKey(
                HealthConstants.HeartRate.HEALTH_DATA_TYPE, HealthPermissionManager.PermissionType.READ));
            
            // Request permissions
            HealthPermissionManager pmsManager = new HealthPermissionManager(healthDataStore);
            pmsManager.requestPermissions(permissionKeys, null).setResultListener(result -> {
                // Handle permission result
                JSONObject response = new JSONObject();
                for (HealthPermissionManager.PermissionKey key : result.getSuccessfulPermissions()) {
                    response.put(key.getDataType(), "permission_granted");
                }
                // You might want to notify the web app about the permission result
            });

            return "{}"; // Return empty result, actual results will be sent via callback
        } catch (Exception e) {
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }

    @JavascriptInterface
    public String getSleepData(long startTime, long endTime) {
        try {
            HealthDataResolver resolver = new HealthDataResolver(healthDataStore, null);
            HealthDataResolver.ReadRequest request = new HealthDataResolver.ReadRequest.Builder()
                .setDataType(HealthConstants.Sleep.HEALTH_DATA_TYPE)
                .setLocalTimeRange(HealthConstants.Sleep.START_TIME, HealthConstants.Sleep.TIME_OFFSET,
                        startTime, endTime)
                .build();

            resolver.read(request).setResultListener(result -> {
                JSONArray sleepData = new JSONArray();
                try {
                    while (result.hasNext()) {
                        HealthData data = result.next();
                        JSONObject sleepEntry = new JSONObject();
                        sleepEntry.put("startDate", data.getLong(HealthConstants.Sleep.START_TIME));
                        sleepEntry.put("endDate", data.getLong(HealthConstants.Sleep.END_TIME));
                        sleepEntry.put("sleepCycle", data.getString(HealthConstants.Sleep.SLEEP_CYCLE));
                        sleepData.put(sleepEntry);
                    }
                    // You would need to implement a way to send this data back to the web app
                } catch (Exception e) {
                    e.printStackTrace();
                }
            });

            return "{}"; // Return empty result, actual results will be sent via callback
        } catch (Exception e) {
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }

    @JavascriptInterface
    public String getHeartRateData(long startTime, long endTime) {
        // Similar implementation to getSleepData but for heart rate
        // Implementation details omitted for brevity
        return "{}";
    }

    @JavascriptInterface
    public String getMotionData(long startTime, long endTime) {
        // Similar implementation to getSleepData but for motion data
        // Implementation details omitted for brevity
        return "{}";
    }

    public void onResume() {
        if (isInitialized && !isConnected) {
            healthDataStore.connectService();
        }
    }

    public void onPause() {
        if (isConnected) {
            healthDataStore.disconnectService();
        }
    }
} 