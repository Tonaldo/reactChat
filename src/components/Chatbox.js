import React from 'react';
import Moment from 'react-moment';

import './Chatbox.css'
    const Chatbox = ({message}) => (
      <div className="chat-box">
        <div className="chat-message">
          <h5>{message.from}</h5>
          <span> -- </span> <h5 className="date"><Moment format="DD.MM.YYYY HH:mm" date={message.createdAt}></Moment></h5>
          <p>
            {message.content}
          </p>
        </div>
      </div>
    );
    export default Chatbox;