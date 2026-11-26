package mx.forja.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;
import java.io.IOException;

public final class MainActivity extends Activity {
    private static final String HOST = "appassets.androidplatform.net";
    private WebView web;
    private FrameLayout root;
    private View fullscreen;
    private WebChromeClient.CustomViewCallback fullscreenCallback;

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        int background = Color.rgb(16, 17, 18);
        getWindow().setStatusBarColor(background);
        getWindow().setNavigationBarColor(background);

        root = new FrameLayout(this);
        root.setBackgroundColor(background);
        web = new WebView(this);
        web.setBackgroundColor(background);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(false);
        web.getSettings().setAllowContentAccess(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (!"https".equals(url.getScheme()) || !HOST.equals(url.getHost())) return null;
                String path = url.getPath();
                if (path != null && path.startsWith("/forja/") && !path.contains("..")) {
                    String asset = path.substring("/forja/".length());
                    try {
                        return new WebResourceResponse(mime(asset), "UTF-8", getAssets().open(asset));
                    } catch (IOException ignored) {
                        // Return a local 404 for missing application assets.
                    }
                }
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, null);
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri url = request.getUrl();
                if (!request.isForMainFrame()) return false;
                if ("https".equals(url.getScheme())) {
                    if (HOST.equals(url.getHost())) return false;
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, url));
                    } catch (ActivityNotFoundException ignored) {
                        Toast.makeText(MainActivity.this, "No se encontró una app para abrir el enlace.", Toast.LENGTH_SHORT).show();
                    }
                }
                return true;
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (fullscreen != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                fullscreen = view;
                fullscreenCallback = callback;
                root.addView(view, new FrameLayout.LayoutParams(-1, -1));
                web.setVisibility(View.INVISIBLE);
                root.getWindowInsetsController().hide(android.view.WindowInsets.Type.systemBars());
            }

            @Override
            public void onHideCustomView() {
                closeFullscreen();
            }
        });
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        if (state == null || web.restoreState(state) == null) {
            web.loadUrl("https://" + HOST + "/forja/index.html");
        }
    }

    private static String mime(String asset) {
        if (asset.endsWith(".html")) return "text/html";
        if (asset.endsWith(".js")) return "text/javascript";
        if (asset.endsWith(".css")) return "text/css";
        if (asset.endsWith(".woff2")) return "font/woff2";
        if (asset.endsWith(".jpg")) return "image/jpeg";
        return "text/plain";
    }

    private void closeFullscreen() {
        if (fullscreen == null) return;
        root.removeView(fullscreen);
        fullscreen = null;
        web.setVisibility(View.VISIBLE);
        root.getWindowInsetsController().show(android.view.WindowInsets.Type.systemBars());
        fullscreenCallback.onCustomViewHidden();
        fullscreenCallback = null;
    }

    @Override
    public void onBackPressed() {
        if (fullscreen != null) {
            closeFullscreen();
            return;
        }
        web.evaluateJavascript("(() => { const d = document.querySelector('dialog[open]'); if (!d) return false; d.close(); return true; })()", closed -> {
            if ("true".equals(closed)) return;
            if (web.canGoBack()) web.goBack();
            else super.onBackPressed();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle state) {
        super.onSaveInstanceState(state);
        web.saveState(state);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        closeFullscreen();
        root.removeView(web);
        web.destroy();
        super.onDestroy();
    }
}
