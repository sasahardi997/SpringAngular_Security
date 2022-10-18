package com.hardi.Server.domain;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Data
@Entity
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, updatable = false)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Long id;

    private String userId;

    private String firstName;

    private String lastName;

    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) //Hide property (Without DTO)
    private String password;

    private String email;

    private String profileImageUrl;

    private Date lastLoginDate;

    private Date lastLoginDateDisplay;

    private Date joinDate;

    private String role; //ROLE_USER{read, update}, ROLE_ADMIN{delete} ETC...

    private String[] authorities;

    private boolean isActive;

    private boolean isNotLocked;
}
