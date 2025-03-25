package com.sleeptracker;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebSettings;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private SamsungHealthBridge healthBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize Samsung Health Bridge
        healthBridge = new SamsungHealthBridge(this);

        // Setup WebView
        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // Add the bridge interface
        webView.addJavascriptInterface(healthBridge, "SamsungHealthBridge");

        // Load your web application
        // For development, load from localhost
        webView.loadUrl("http://localhost:3000");
        // For production, load from assets
        // webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    protected void onResume() {
        super.onResume();
        healthBridge.onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        healthBridge.onPause();
    }
} 