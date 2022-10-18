package com.hardi.Server.exceptions.domain;

public class EmailExistsException extends Exception{

    public EmailExistsException(String message) {
        super(message);
    }
}
