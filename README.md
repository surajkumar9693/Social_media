# Social-Media-App

notes :- we have to change this readme file after the compition of this prject

## User APIs 
### 1) POST /register
1) A profile is created on the Social Media platform with handling many validations like ‘age should be more than 13’, the username should be unique etc. 
2) Some fields have not been kept mandatory, like the profile image, bio and location.
3) Upload image to S3 bucket and save it's public url in user document.
4) A user is then successfully able to create a profile on the social media platform.


### 2) POST /login
1) In this api we have handled two cases like user can login with combination of either email and password or mobile and password. we have been used strict validation like email should be valid and mobile should be indian number.
2) On a successful login attempt return the userId and a JWT token contatining the userId, exp, iat.

### After login we have to take userId from JWT token only not from params

### 3) GET /user
1) In this api we have to handles two scenario 
  - user can see their own profile
  - user can see other profile when we enters thier userId in queryparams 

### 4) PUT /user (Authentication and Authorization required)
1) Allow an user to update their profile.
2) A user can update all the fields
3) Make sure that userId in url param and in token is same

### 5) DELETE /user
1) here we have to delete users profile completely one tricky part is we have to enter their password again while deleteing so we will use byrypt to compare the password after matching profile will delete






