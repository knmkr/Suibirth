package com.ac.Suibirth;

import android.app.Application;

/**
 * Created by Gigi on 10/22/2017.
 */

public class MyAppApplication extends Application {

    private String mGlobalUserName;

    public String getGlobalUserName() {
        return mGlobalUserName;
    }

    public void setGlobalUserName(String str) {
        mGlobalUserName = str;
    }
}
