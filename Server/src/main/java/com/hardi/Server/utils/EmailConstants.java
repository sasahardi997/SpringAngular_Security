package com.hardi.Server.utils;

public class EmailConstants {

    public static final String SIMPLE_MAIL_TRANSFER_PROTOCOL = "smtps";

    @Value("${SMTP_USERNAME}")
    public static final String USERNAME;

    @Value("${SMTP_PASSWORD}")
    public static final String PASSWORD;

    @Value("${SMTP_MAIL}")
    public static final String FROM_EMAIL;

    public static final String CC_EMAIL = "";

    public static final String EMAIL_SUBJECT = "Get Arrays, LLC - New Password";

    public static final String GMAIL_SMTP_SERVER = "smtp.gmail.com";

    public static final String SMTP_HOST = "mail.smtp.host";

    public static final String SMTP_AUTH = "mail.smtp.auth";

    public static final String SMTP_PORT = "mail.smtp.port";

    public static final int DEFAULT_PORT = 465;

    public static final String SMTP_STARTTLS_ENABLE = "mail.smtp.starttls.enable";

    public static final String SMTP_STARTTLS_REQUIRED = "mail.smtp.starttls.required";

}
