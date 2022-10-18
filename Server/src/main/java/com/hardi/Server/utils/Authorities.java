package com.hardi.Server.utils;

public class Authorities {

    public static final String[] USER_AUTHORITIES = {"user:read"};

    public static final String[] HR_AUTHORITIES = {"user:read", "user:update"};

    public static final String[] MANAGER_AUTHORITIES = {"user:read", "user:update"};

    public static final String[] ADMIN_AUTHORITIES = {"user:read", "user:update", "user:create"};

    public static final String[] SUPER_ADMIN_AUTHORITIES = {"user:read", "user:update", "user:create", "user:delete"};
}
