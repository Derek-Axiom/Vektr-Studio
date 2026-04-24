package com.vektr.studio;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Required for SharedArrayBuffer support in Android WebView.
        // HTTP-level COOP/COEP headers alone are insufficient on Android -
        // cross-origin isolation must also be enforced at the native WebView layer.
        WebView webView = getBridge().getWebView();
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);

        // Force cross-origin isolation mode on the WebView renderer.
        // This is the Android-native equivalent of the COOP/COEP headers
        // already configured in vite.config.ts for the dev server.
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
            webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        }

        // Enable SharedArrayBuffer: requires the WebView to be in cross-origin
        // isolated context. Capacitor's bridge handles the JS bridge handshake,
        // but the WebView itself must be told to permit this explicitly.
        webView.getSettings().setAllowContentAccess(false);
        webView.getSettings().setAllowFileAccessFromFileURLs(false);
        webView.getSettings().setAllowUniversalAccessFromFileURLs(false);
    }
}


