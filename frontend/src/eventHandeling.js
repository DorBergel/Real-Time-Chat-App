/**
 * This function handles the new message received event.
 * It updates the userChats state with the new message or adds a new chat if it doesn't exist.
 * It also updates the messages state with the new message.
 * @param {*} message
 * @param {*} userChats
 * @param {*} setUserChats
 * @param {*} messages
 * @param {*} setMessages
 * @param {*} currentChat
 */
exports.handleNewMessageReceived = (
  message,
  userChats,
  setUserChats,
  messages,
  setMessages,
  currentChat
) => {
  console.log("New message received:", message.load.message);

  // Find the chat that the message belongs to
  const chatIndex = userChats.findIndex(
    (chat) => chat._id === message.load.chat._id
  );
  console.log("Chat index found:", chatIndex);

  if (chatIndex !== -1) {
    // Update the last message for the chat
    setUserChats((prevChats) => {
      const updatedChats = [...prevChats];
      updatedChats[chatIndex] = {
        ...updatedChats[chatIndex],
        lastMessage: message.load.message,
      };
      return updatedChats;
    });

    // Add the new message to the messages state only if it belongs to the current chat
    if (currentChat && currentChat._id === message.load.chat._id) {
      setMessages((prevMessages) => [...prevMessages, message.load.message]);
    }
  } else {
    // If chat does not exist, add it only if it's a valid chat object
    if (message.load.chat && message.load.chat._id) {
      setUserChats((prevChats) => {
        const uniqueChats = prevChats.filter(
          (chat) => chat._id !== message.load.chat._id
        );
        return [...uniqueChats, message.load.chat];
      });

      // Add the new message to the messages state only if it belongs to the current chat
      if (currentChat && currentChat._id === message.load.chat._id) {
        setMessages((prevMessages) => [...prevMessages, message.load.message]);
      }
    } else {
      console.warn("Invalid chat object received:", message.load.chat);
    }
  }
};

/**
 * This function handles the new chat created event.
 * It updates the userChats state with the new chat or updates the current chat if it already exists.
 * It also sets the current chat to the new chat if it doesn't exist.
 * @param {*} message
 * @param {*} userChats
 * @param {*} setUserChats
 * @param {*} currentChat
 * @param {*} setCurrentChat
 */
exports.handleNewChatCreated = (
  message,
  userChats,
  setUserChats,
  currentChat,
  setCurrentChat
) => {
  console.log("New chat created:", message.load.chat);

  // Check if the chat already exists in userChats
  const existingChatIndex = userChats.findIndex(
    (chat) => chat._id === message.load.chat._id
  );

  if (existingChatIndex !== -1) {
    // If chat exists, update the current chat
    console.log(
      "Updating current chat with existing chat:",
      userChats[existingChatIndex]
    );
    setCurrentChat(userChats[existingChatIndex]);
  } else {
    // If chat does not exist, set it as current chat
    console.log("currentChat is temporary: ", currentChat);
    setCurrentChat(message.load.chat);
    console.log("Setting new chat as current chat:", message.load.chat);
  }
};

/**
 * This function handles the seen event received.
 * It updates the userChats state with the seen status for the last message in the chat.
 * It also updates the messages state with the seen status for the messages in the current chat.
 * It finds the chat that the seen event belongs to and updates the messages accordingly.
 * This is used to mark messages as seen when the user has read them.
 * @param {} message
 * @param {*} userChats
 * @param {*} setUserChats
 * @param {*} messages
 * @param {*} setMessages
 * @param {*} currentChat
 * @param {*} setCurrentChat
 */
exports.handleSeenEventReceived = (
  message,
  userChats,
  setUserChats,
  messages,
  setMessages,
  currentChat,
  setCurrentChat
) => {
  console.log("Seen event received:", message.load);

  const { chatId, messagesId } = message.load;
  const userId = message.userId; // Extract the userId from the message

  // Find the chat that the seen event belongs to
  const chatIndex = userChats.findIndex((chat) => chat._id === chatId);
  console.log("Chat index found:", chatIndex);

  // If chat exists, update the seenBy array for the relevant messages
  if (chatIndex !== -1) {
    console.log(
      "Updating seenBy status for messages in chat:",
      userChats[chatIndex]
    );

    console.log(":::: userChats before update:", userChats);
    console.log(":::: messagesId to update:", messagesId);

    // Update the userChats seenBy state array for the last message
    setUserChats((prevChats) => {
      return prevChats.map((chat) => {
        if (chat._id === chatId) {
          return {
            ...chat,
            lastMessage: {
              ...chat.lastMessage,
              seenBy: [...(chat.lastMessage.seenBy || []), userId], // Add the userId to the seenBy array
            },
          };
        }
        return chat; // Return the chat unchanged if not the relevant chat
      });
    });

    console.log(":::: userChats after update:", userChats);

    console.log(":::: messages before update:", messages);

    // Update the messages seenBy state array for the relevant messages
    setMessages((prevMessages) => {
      return prevMessages.map((msg) => {
        if (messagesId.includes(msg._id)) {
          return {
            ...msg,
            seenBy: [...(msg.seenBy || []), userId], // Add the userId to the seenBy array
          };
        }
        return msg; // Return the message unchanged if not relevant
      });
    });

    console.log(":::: messages after update:", messages);
  }
};

/**
 * This function handles the typing event received.
 * It updates the userChats state with the typing status for the relevant chat.
 * It also updates the current chat with the typing status if it matches the relevant chat.
 * The typing status is reset after a delay using a debounce mechanism.
 * @param {*} message
 * @param {*} userChats
 * @param {*} setUserChats
 * @param {*} messages
 * @param {*} setMessages
 * @param {*} currentChat
 * @param {*} setCurrentChat
 */
exports.handleTypingEventReceived = (
  message,
  userChats,
  setUserChats,
  messages,
  setMessages,
  currentChat,
  setCurrentChat
) => {
  console.log("Typing event received:", message.load);

  const { chatId } = message.load;

  const relevantChat = userChats.find((chat) => chat._id === chatId);
  if (relevantChat && message.userId !== localStorage.getItem("user-id")) {
    console.log("Setting typing status for chat:", relevantChat.title);

    // Update typing status for the relevant chat
    setUserChats((prevChats) => {
      return prevChats.map((chat) => {
        if (chat._id === chatId) {
          return { ...chat, isTyping: true }; // Set typing status
        }
        return chat; // Return other chats unchanged
      });
    });

    // Update typing status for the current chat
    setCurrentChat((prevChat) => {
      if (prevChat && prevChat._id === chatId) {
        return { ...prevChat, isTyping: true }; // Set typing status
      }
      return prevChat; // Return current chat unchanged
    });

    // Reset typing status after a delay using debounce
    const resetTypingStatus = () => {
      setUserChats((prevChats) => {
        return prevChats.map((chat) => {
          if (chat._id === chatId) {
            return { ...chat, isTyping: false }; // Reset typing status
          }
          return chat; // Return other chats unchanged
        });
      });

      setCurrentChat((prevChat) => {
        if (prevChat && prevChat._id === chatId) {
          return { ...prevChat, isTyping: false }; // Reset typing status
        }
        return prevChat; // Return current chat unchanged
      });
    };

    // Use a debounce mechanism to reset typing status
    clearTimeout(relevantChat.typingTimeout);
    relevantChat.typingTimeout = setTimeout(resetTypingStatus, 3000); // Timeout duration set to 3 seconds
  } else {
    console.warn(
      "Typing event received for an unknown chat or self:",
      message.load
    );
  }
};

exports.handleNewGroupChatCreated = (
  message,
  userChats,
  setUserChats,
  currentChat,
  setCurrentChat
) => {
  console.log("New group chat created:", message.load.chat);

  setUserChats((prevChats) => {
    const uniqueChats = prevChats.filter(
      (chat) => chat._id !== message.load.chat._id
    );
    return [...uniqueChats, message.load.chat];
  });
};
