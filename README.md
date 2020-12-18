# topological-reads
#### Service for sharing nonlinear reading lists

Nicole Crockett, Chris Giordano, David Horowitz, Edward Minnix III, and William Spichiger
### Git Repo: https://github.com/topological-reads/topological-reads
### Instructions

Create a new empty directory at the desired location
- Run git clone https://github.com/topological-reads/topological-reads.git .
- Run  npm install
- Run  npm start
- Navigate to http://localhost:3000
- Create an account on the login screen and proceed to use the application

### Pages
#### Login
This page contains forms for current users to log in and new users to sign up. This is the only page on the site that users can access without logging in.
#### Home
The homepage is the central location for the site. Once a user logs in successfully, they are brought here. It has several sections, each which correspond to a portion of the site that is relevant to the logged in user. The “Read Books” section allows the user to see all of the books they have finished reading. The “Currently Reading” section allows the user to see books they are in the process of reading, and mark them as read when finished. The “Create a group” section allows users to create new Groups and see their current group membership and invitations. “My Reading Lists” allows users to see what reading lists they have created and make new ones. “Followed Lists” and “Followed Users” allows the user to see what reading lists and users they have followed.
#### Books
The books page lists all books that are in the database. A search bar at the top allows for users to search based on title, author or ISBN. Each book has a button to add the book to their currently reading list, add it to their read books list, or add the book to a reading list they have created.
#### Groups
The overall groups page contains a list of all of the public groups that are available to view or join.  Each group, though, has its own individual page.  These individual pages will give you access to the forum data where you can see the threads that have been made for that group.  These threads also have their own pages where the comments made about the thread can be viewed.  There are also special privileges given to those who are either admins of the group or the owner of the group.  The owner has the ability to delete and add people as admins (assuming that they are members first) and the admins can add or invite members to the group based on the type of group.  Private groups require an invitation to join whereas public groups can be joined by anyone (as long as they are logged into the site).  Invitations are on the homepage as mentioned above.
#### Tags
The tags page allows groups and lists to be tagged and searched by these tags, similar to how hashtags work on twitter.
#### Lists
The lists page shows a list of every reading list that is owned by a user or group. These reading lists have links to individual list pages and also display the reading list’s name and its owners. The individual list page displays a number of books in order for someone to follow. Each book has a button to mark a book as in progress or read so that users can follow along with the reading list. 
