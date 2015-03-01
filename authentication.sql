START TRANSACTION;
SELECT @A:=userID FROM users WHERE userName = "user";
SELECT @B:=roomID from rooms WHERE name = "lobby";
INSERT  INTO messages (message)
	values("hello this is a message");
SET @C:=LAST_INSERT_ID();
INSERT INTO messagesroom (messageID, roomID)
	values(@C, @B);
INSERT INTO messagesuser (messageID, userID)
	values(@C, @A);
COMMIT;
