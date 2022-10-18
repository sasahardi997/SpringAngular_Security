package com.hardi.Server.service;

import com.hardi.Server.domain.User;
import com.hardi.Server.exceptions.domain.EmailExistsException;
import com.hardi.Server.exceptions.domain.EmailNotFoundException;
import com.hardi.Server.exceptions.domain.NotImageFileException;
import com.hardi.Server.exceptions.domain.UsernameExistsException;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;
import java.io.IOException;
import java.util.List;

public interface UserService {

    User register(String firstName, String lastName, String username, String email) throws UsernameExistsException, EmailExistsException, MessagingException;

    List<User> getUsers();

    User findUserByUsername(String username);

    User findUserByEmail(String email);

    User addNewUser(String firstName, String lastName, String username, String email, String role,
                    Boolean isNonBlocked, Boolean isActive, MultipartFile profileImage) throws UsernameExistsException, EmailExistsException, IOException, NotImageFileException;

    User updateUser(String currentUsername, String newFirstName, String newLastName, String newUsername, String newEmail, String role,
                     Boolean isNonBlocked, Boolean isActive, MultipartFile profileImage) throws UsernameExistsException, EmailExistsException, IOException, NotImageFileException;

    void deleteUser(String username) throws IOException;

    void resetPassword(String email) throws EmailNotFoundException, MessagingException;

    User updateProfileImage(String username, MultipartFile profileImage) throws UsernameExistsException, EmailExistsException, IOException, NotImageFileException;
}
