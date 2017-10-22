package com.ac.Suibirth;

import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.StrictMode;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Toast;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.SocketTimeoutException;
import java.net.URL;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;


public class LocActivity extends AppCompatActivity implements LocationListener{
    private LocationManager locationManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_loc);
        if (android.os.Build.VERSION.SDK_INT > 9) {
            StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
            StrictMode.setThreadPolicy(policy);
        }

        // Acquire a reference to the system Location Manager
        Log.e("yyyyy: ","111");
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        if ( Build.VERSION.SDK_INT >= 23 &&
                ContextCompat.checkSelfPermission( this, android.Manifest.permission.ACCESS_FINE_LOCATION ) != PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission( this, android.Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            Log.e("Message: ","checkSelfPermission");
            return  ;
        }

        // Register the listener with the Location Manager to receive location updates
        //minimum time interval between location updates, in milliseconds : 1000*60*3
        //minimum distance between location updates, in meters : 20
        Log.e("yyyyy: ","222");
        locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 0, 0, this);
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 0, 0, this);
        Log.e("yyyyy: ","333");
        Location location = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
        Log.e("yyyyy: ", "444");
        if (location != null) {
//            sendLocation(location.getLatitude(),location.getLongitude());
            String msg="New Latitude: "+location.getLatitude() + "New Longitude: "+location.getLongitude();
            Toast.makeText(getBaseContext(),msg, Toast.LENGTH_LONG).show();
            Log.i("yyyyy: ","Location changed, " + location.getAccuracy() + " , " + location.getLatitude()+ "," + location.getLongitude());
        } else {Log.e("yyyyy: ", "localtion is null");}
    }

    @Override
    public void onLocationChanged(Location location) {
        if(location == null) {
            Toast.makeText(this, "Unable to find your location, try again", Toast.LENGTH_SHORT).show();
            Log.d("yyyyy: ","null");
        }
        // TODO:Called when a new location is found by the network location provider.
        sendLocation(location.getLatitude(),location.getLongitude());
        MyAppApplication mApp = ((MyAppApplication)getApplicationContext());
        String mobile = mApp.getGlobalUserName();
        String msg="User:"+mobile+" New Latitude: "+location.getLatitude() + "New Longitude: "+location.getLongitude();
        Toast.makeText(getBaseContext(),msg, Toast.LENGTH_LONG).show();
        Log.d("yyyyy: ","Location changed, " + location.getAccuracy() + " , " + location.getLatitude()+ "," + location.getLongitude());
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {}
    @Override
    public void onProviderEnabled(String provider) {}
    @Override
    public void onProviderDisabled(String provider) {}

    private String getQuery(List<NameValuePair> params) throws UnsupportedEncodingException
    {
        StringBuilder result = new StringBuilder();
        boolean first = true;

        for (NameValuePair pair : params)
        {
            if (first)
                first = false;
            else
                result.append("&");

            result.append(URLEncoder.encode(pair.getName(), "UTF-8"));
            result.append("=");
            result.append(URLEncoder.encode(pair.getValue(), "UTF-8"));
        }

        return result.toString();
    }

    private void sendLocation(final double lat, final double lon) {

        HttpURLConnection client = null;
        try {
            Log.e("yyyyy: ", "aaaaaaaa");
            URL url = new URL("http://34.211.221.126:9999/update/");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

//            conn.setReadTimeout(10000);
//            conn.setConnectTimeout(15000);
            conn.setInstanceFollowRedirects(false);
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
//            conn.setRequestProperty("charset", "utf-8");
            conn.setUseCaches(false);
//            conn.setDoInput(true);
            conn.setDoOutput(true);

            List<NameValuePair> params = new ArrayList<NameValuePair>();
            MyAppApplication mApp = ((MyAppApplication)getApplicationContext());
            params.add(new BasicNameValuePair("username", mApp.getGlobalUserName()));
            params.add(new BasicNameValuePair("longtitute", Double.toString(lon)));
            params.add(new BasicNameValuePair("latitute", Double.toString(lat)));

            OutputStream os = conn.getOutputStream();
            BufferedWriter writer = new BufferedWriter(
                    new OutputStreamWriter(os, "UTF-8"));
            Log.e("yyyyy: ",getQuery(params));
            writer.write(getQuery(params));
            writer.flush();
            writer.close();
            os.close();

            String tmp = conn.getResponseMessage();
            Log.e("yyyyyyyyy: ", tmp);
        }
        catch(MalformedURLException error) {
            //Handles an incorrectly entered URL
            System.err.println("MalformedURLException: " + error.getMessage());
        }
        catch(SocketTimeoutException error) {
//Handles URL access timeout.
        }
        catch (IOException error) {
//Handles input and output errors
        }
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
