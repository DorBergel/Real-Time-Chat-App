
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
exports.handleNewMessageReceived = (message, userChats, setUserChats, messages, setMessages, currentChat) => {
    console.log("New message received:", message.load.message);

        // Find the chat that the message belongs to
        const chatIndex = userChats.findIndex(
          (chat) => chat._id === message.load.chat._id
        );
        console.log("Chat index found:", chatIndex);
        if (chatIndex !== -1) {
          // If chat exists, update the last message
          console.log(
            "Updating last message for existing chat:",
            userChats[chatIndex]
          );
          setUserChats((prevChats) => {
            const updatedChats = [...prevChats];
            updatedChats[chatIndex] = {
              ...updatedChats[chatIndex],
              lastMessage: message.load.message, // Update the last message
            };
            return updatedChats;
          });
            // Add the new message to the messages state
            setMessages((prevMessages) => [
                ...prevMessages,
                message.load.message, // Add the new message to the messages state
                ]);
        } else {
          // If chat does not exist, add it only if it's a valid chat object
          if (message.load.chat && message.load.chat._id) {
            console.log("Adding new chat to userChats:", message.load.chat);
            setUserChats((prevChats) => {
              const uniqueChats = prevChats.filter(
                (chat) => chat._id !== message.load.chat._id
              );
              return [...uniqueChats, message.load.chat];
            });
            // TODO: Understand why the message is not shown in the chat Room
            setMessages((prevMessages) => [
              ...prevMessages,
              message.load.message, // Add the new message to the messages state
            ]);
          } else {
            console.warn("Invalid chat object received:", message.load.chat);
          }
        }
}

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
exports.handleNewChatCreated = (message, userChats, setUserChats, currentChat, setCurrentChat) => {
    console.log("New chat created:", message.load.chat);

    // Check if the chat already exists in userChats
    const existingChatIndex = userChats.findIndex(
        (chat) => chat._id === message.load.chat._id
    );

    if (existingChatIndex !== -1) {
        // If chat exists, update the current chat
        console.log("Updating current chat with existing chat:", userChats[existingChatIndex]);
        setCurrentChat(userChats[existingChatIndex]);
    } else {
        // If chat does not exist, set it as current chat
        console.log("currentChat is temporary: ", currentChat);
        setCurrentChat(message.load.chat);
        console.log("Setting new chat as current chat:", message.load.chat);
    }
}

exports.handleSeenEventReceived = (message, userChats, setUserChats, messages, setMessages, currentChat, setCurrentChat) => {
    console.log("Seen event received:", message.load);

    const { chatId, messagesId } = message.load;
    
    
}