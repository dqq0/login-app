# Guía de Migración de Deathcloud a Android Studio

Ahora que ya clonamos los últimos cambios con los WebSockets y el Chat, el siguiente paso es migrar el proyecto y lograr que la app ejecute el frontend en Android Studio conectándose a tu servidor NodeJS.

## 1. El Problema de `localhost` en Android
> [!WARNING]
> En Android Studio, si usas el Emulador Oficial, `localhost` apunta al teléfono virtual mismo, no a tu computadora.
> Por lo tanto, el emulador **no encontrará tu servidor NodeJS en localhost:3000**.

Para solucionarlo, debes cambiar en `frontend/js/login.js` todas las menciones que digan `http://localhost:3000` por la IP especial del emulador: **`http://10.0.2.2:3000`**. 

*Si vas a probar usando un teléfono android real por USB/WiFi en lugar del emulador, debes poner la IP de tu computadora en la red Wi-Fi (ej. `http://192.168.1.15:3000`).*

## 2. Preparar el Proyecto en Android Studio

Una forma rápida de encapsular un "Frontend web" en una app de Android es usando un componente llamado `WebView`. 

1. Abre **Android Studio** y crea un nuevo proyecto ("Empty Views Activity").
2. En la carpeta del proyecto, ve a `app/src/main/` y crea una carpeta llamada `assets`. 
3. **Copia toda tu carpeta `frontend/`** dentro de esta nueva carpeta `assets/`. De forma que quede: `app/src/main/assets/frontend/index.html`.

## 3. Configurar Android Manifest

Tu aplicación va a necesitar permisos de Internet para acceder a los WebSockets y conectarse al Node.js, así como permisos para páginas web locales en texto plano (HTTP clásico sin HTTPS).

Abre `app/src/main/AndroidManifest.xml` y agrega lo siguiente:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- 1. PEDIR PERMISO DE INTERNET -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Deathcloud"
        android:usesCleartextTraffic="true"> <!-- 2. HABILITAR TRAFICO HTTP (NO HTTPS) -->
        
        <activity android:name=".MainActivity" ... >
            <!-- ... -->
        </activity>
    </application>
</manifest>
```

## 4. Código del WebView en Kotlin/Java

Finalmente, en el archivo principal `MainActivity.kt` (o `.java`), configurarás tu app para que lea el `index.html` e inicialice Javascript y WebSockets.

**Si usas Kotlin (`MainActivity.kt`):**
```kotlin
package com.example.deathcloud

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Creamos la pantalla Web
        val myWebView = WebView(this)
        setContentView(myWebView)

        // Activamos configuraciones extremadamente importantes para React, WebSockets y CORS local
        val webSettings: WebSettings = myWebView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true // Requerido para React
        
        // Habilitar acceso a scripts locales (Babel/React)
        webSettings.allowFileAccess = true
        webSettings.allowFileAccessFromFileURLs = true
        webSettings.allowUniversalAccessFromFileURLs = true
        
        myWebView.webViewClient = WebViewClient()

        // Cargamos tu HTML desde la carpeta local assets
        myWebView.loadUrl("file:///android_asset/index.html")
    }
}
```

## Resumen de pasos:
1. Recuerda arrancar tu backend node en la PC (`npm start`).
2. Cambia `localhost` por `10.0.2.2` en tu JS.
3. Mete tu front al `assets` de Android Studio.
4. Dale permisos de internet y usa WebView con `javaScriptEnabled`.
