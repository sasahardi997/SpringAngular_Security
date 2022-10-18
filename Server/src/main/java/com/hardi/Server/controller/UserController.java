package com.hardi.Server.controller;

import com.hardi.Server.domain.HttpResponse;
import com.hardi.Server.domain.User;
import com.hardi.Server.domain.UserPrincipal;
import com.hardi.Server.exceptions.ExceptionHandling;
import com.hardi.Server.exceptions.domain.EmailExistsException;
import com.hardi.Server.exceptions.domain.EmailNotFoundException;
import com.hardi.Server.exceptions.domain.NotImageFileException;
import com.hardi.Server.exceptions.domain.UsernameExistsException;
import com.hardi.Server.service.UserService;
import com.hardi.Server.utils.JwtTokenProviderUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.mail.MessagingException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

import static com.hardi.Server.utils.FileConstants.*;
import static com.hardi.Server.utils.SecurityConstants.JWT_TOKEN_HEADER;
import static org.springframework.http.MediaType.IMAGE_JPEG_VALUE;

@RestController
@RequestMapping("/user")
public class UserController extends ExceptionHandling {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProviderUtils jwtTokenProviderUtils;

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) throws UsernameExistsException, EmailExistsException, MessagingException {
        User saved = userService.register(user.getFirstName(), user.getLastName(), user.getUsername(), user.getEmail());
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user){
        authenticate(user.getUsername(), user.getPassword());
        User loggedUser = userService.findUserByUsername(user.getUsername());
        UserPrincipal userPrincipal = new UserPrincipal(loggedUser);
        HttpHeaders jwtHeader = getJwtHeader(userPrincipal);

        return new ResponseEntity<>(loggedUser, jwtHeader, HttpStatus.CREATED);
    }

    @PostMapping("/add")
    public ResponseEntity<User> addNewsUser(@RequestParam("firstName") String firstName,
                                            @RequestParam("lastName") String lastName,
                                            @RequestParam("username") String username,
                                            @RequestParam("email") String email,
                                            @RequestParam("role") String role,
                                            @RequestParam("isActive") String isActive,
                                            @RequestParam(value = "isNotLocked") String isNonBlocked,
                                            @RequestParam(value = "profileImage", required = false)MultipartFile profileImage) throws UsernameExistsException, EmailExistsException, IOException, NotImageFileException {
        User newUser = userService.addNewUser(firstName, lastName, username, email, role,
               Boolean.parseBoolean(isNonBlocked),  Boolean.parseBoolean(isActive), profileImage);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @PutMapping("/update")
    public ResponseEntity<User> updateUser(@RequestParam("currentUsername") String currentUsername,
                                            @RequestParam("firstName") String firstName,
                                            @RequestParam("lastName") String lastName,
                                            @RequestParam("username") String username,
                                            @RequestParam("email") String email,
                                            @RequestParam("role") String role,
                                            @RequestParam("isActive") String isActive,
                                            @RequestParam(value = "isNotLocked") String isNonBlocked,
                                            @RequestParam(value = "profileImage", required = false)MultipartFile profileImage) throws UsernameExistsException, EmailExistsException, IOException, NotImageFileException {
        User updatedUser = userService.updateUser(currentUsername, firstName, lastName, username, email, role,
                Boolean.parseBoolean(isNonBlocked),  Boolean.parseBoolean(isActive), profileImage);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @GetMapping("/find/{username}")
    public ResponseEntity<User> getUser(@PathVariable("username") String username) {
        User user = userService.findUserByUsername(username);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/list")
    public ResponseEntity<List<User>> getListOfUsers() {
        List<User> users = userService.getUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @GetMapping("/reset-password/{email}")
    public ResponseEntity<HttpResponse> resetPassword(@PathVariable("email") String email) throws EmailNotFoundException, MessagingException {
        userService.resetPassword(email);
        return new ResponseEntity<HttpResponse>(HttpStatus.OK);
    }

    @PutMapping("/update-profile-image")
    public ResponseEntity<User> updateProfileImage(@RequestParam("username") String username,
                                                   @RequestParam(value = "profileImage") MultipartFile profileImage) throws UsernameExistsException, EmailExistsException, IOException, NotImageFileException {
        User updatedUser = userService.updateProfileImage(username, profileImage);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{username}")
//    @PreAuthorize("hasAnyAuthority('user:delete')")
    public ResponseEntity<Void> deleteUser(@PathVariable String username) throws IOException {
        userService.deleteUser(username);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping(path = "/image/{username}/{fileName}", produces = IMAGE_JPEG_VALUE)
    public byte[] getProfileImage(@PathVariable("username") String username,
                                  @PathVariable("fileName") String fileName) throws IOException {
        return Files.readAllBytes(Paths.get(USER_FOLDER + username + FORWARD_SLASH + fileName));
    }

    @GetMapping(path = "/image/profile/{username}", produces = IMAGE_JPEG_VALUE)
    public byte[] getTempProfileImage(@PathVariable("username") String username) throws MalformedURLException {
        URL url = new URL(TEMP_PROFILE_IMAGE_BASE_URL + username);
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();

        try (InputStream inputStream = url.openStream()) {
            int bytesRead;
            byte[] chunk = new byte[1024];
            while ((bytesRead = inputStream.read(chunk)) > 0) {
                byteArrayOutputStream.write(chunk, 0, bytesRead);
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return byteArrayOutputStream.toByteArray();
    }

    private HttpHeaders getJwtHeader(UserPrincipal user) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(JWT_TOKEN_HEADER, jwtTokenProviderUtils.generateJwtToken(user));
        return headers;
    }

    private void authenticate(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
    }
}
