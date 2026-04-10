# Guía de Uso: Configuración de Proyecto Web en Android Studio

Esta guía detalla los pasos necesarios para encapsular un frontend web (HTML/JS/React) dentro de una aplicación nativa en Android Studio y conectarla con un servidor backend (como Node.js).

## 1. Configuración de IP (`localhost` vs Emulador)

> [!WARNING]
> En Android Studio, si se utiliza el Emulador Oficial de Android, la dirección `localhost` o `127.0.0.1` apunta a la red interna del propio dispositivo virtual, no a la red de la computadora que ejecuta el servidor.

Para que el emulador pueda conectarse correctamente al backend alojado en el equipo de desarrollo, se debe reemplazar cualquier mención de `http://localhost:3000` (o el puerto correspondiente) por la IP especial del emulador: **`http://10.0.2.2:3000`**.

*Si la prueba se realiza en un dispositivo físico conectado a través de USB o Wi-Fi, se debe utilizar la dirección IP local de la computadora en la red Wi-Fi (ejemplo: `http://192.168.1.15:3000`).*

## 2. Preparación del Directorio de la App (WebView)

El método más directo para integrar el frontend web en Android es mediante el componente `WebView`.

1. Abrir **Android Studio** y crear un nuevo proyecto seleccionando **Empty Views Activity**.
2. En la estructura del proyecto, navegar hasta `app/src/main/` y crear una nueva carpeta denominada `assets`.
3. **Copiar toda la carpeta del proyecto frontend** (ej: `frontend/`) al interior de la nueva carpeta `assets/`.
   - La estructura final deberá verse similar a: `app/src/main/assets/frontend/index.html`.

## 3. Configuración del Android Manifest

La aplicación requiere permisos para conectarse a Internet (WebSockets, llamados API REST, etc.) y permisos para la transmisión de tráfico en texto plano si se está usando HTTP en desarrollo (en lugar de HTTPS).

Abrir el archivo `app/src/main/AndroidManifest.xml` y agregar los siguientes parámetros:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- 1. SOLICITUD DE PERMISOS DE RED E INTERNET -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Deathcloud"
        android:usesCleartextTraffic="true"> <!-- 2. HABILITAR TRÁFICO HTTP -->
        
        <activity android:name=".MainActivity" ... >
            <!-- ... -->
        </activity>
    </application>
</manifest>
```

## 4. Inicialización del WebView en Kotlin/Java

Finalmente, en el archivo principal de la actividad (usualmente `MainActivity.kt` o `.java`), se configura la Vista Web para cargar el archivo `index.html` y habilitar el uso de JavaScript.

**Ejemplo de implementación en Kotlin (`MainActivity.kt`):**
```kotlin
package com.example.deathcloud // Asegurarse de que coincida con el nombre de paquete real

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
        
        // Instanciar el componente WebView
        val myWebView = WebView(this)
        setContentView(myWebView)

        // Ajustar la configuración para permitir React, LocalStorage y CORS Local
        val webSettings: WebSettings = myWebView.settings
        webSettings.javaScriptEnabled = true
        webSettings.domStorageEnabled = true // Necesario para guardar tokens y almacenamiento web
        
        // Habilitar la lectura de archivos JS estáticos (Babel/React)
        webSettings.allowFileAccess = true
        webSettings.allowFileAccessFromFileURLs = true
        webSettings.allowUniversalAccessFromFileURLs = true
        
        myWebView.webViewClient = WebViewClient()

        // Ejecutar el frontend integrado, ajustando la ruta a la estructura de la carpeta copiada
        myWebView.loadUrl("file:///android_asset/frontend/index.html")
    }
}
```

## Resumen de Despliegue:
1. Iniciar el servicio/backend en la computadora de desarrollo (p. ej. `npm start`).
2. Actualizar las direcciones URL apuntando a las APIs de `localhost` hacia `10.0.2.2` u otra IP de red aplicable.
3. Trasladar el código fuente/frontend de producción consolidado al directorio `assets` de Android Studio.
4. Aplicar permisos en red al `AndroidManifest.xml` y activar el uso explícito de JavaScript en el WebView.
