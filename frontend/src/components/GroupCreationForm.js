import React, { useState } from 'react';

const GroupCreationForm = (
    {username,
    chats = [],
    contacts,
    setContacts,
    currentChat,
    setCurrentChat,
    setChats}) => {

    return (
        <div>
            <h3>New Group</h3>
            <div className='contacts-list'>
                {contacts?.map((contact) => (
                    <div key={contact._id} className='contact-item'>
                        <span>{contact.username}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GroupCreationForm;