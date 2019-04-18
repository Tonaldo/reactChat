import React, { Component } from 'react';

// Import GraphQL helpers
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import { Picker } from 'emoji-mart'


import Chatbox from './components/Chatbox';
import ModalDialog from './components/ModalDialog';
import 'emoji-mart/css/emoji-mart.css'
import './App.css';


class App extends Component {
  state = {
    from: 'anonymous',
    content: '',
    showEmojis: false
  };
  componentDidMount() {
    // Get username form prompt
    // when page loads
    const from = window.prompt('username');
    const color = window.
    from && this.setState({ from });
    this._subscribeToNewChats();
  }

  showEmojis = (e) => {
    this.setState({
      showEmojis: true
    }, () => document.addEventListener('click', this.closeMenu))
  }

  closeMenu = (e) => {
    console.log(this.emojiPicker)
    if (this.emojiPicker !== null && !this.emojiPicker.contains(e.target)) {
      this.setState({
        showEmojis: false
      }, () => document.removeEventListener('click', this.closeMenu))
    }
  }

  addEmoji = (e) => {
    console.log(e.unified)
    let sym = e.unified.split('-')
    let codesArray = []
    sym.forEach(el => codesArray.push('0x' + el))
      //console.log(codesArray)  // ["0x1f3f3", "0xfe0f"]
    let emojiPic = String.fromCodePoint(...codesArray) //("0x1f3f3", "0xfe0f")
    this.setState({
      content: this.state.content + emojiPic
    })
  }

  _createChat = async e => {
     if (e.key === 'Enter') {
       const { content, from } = this.state;
        await this.props.createChatMutation({
          variables: { content, from }
        });
        this.setState({ content: '' });
      }
  };

  _subscribeToNewChats = () => {
    this.props.allChatsQuery.subscribeToMore({
        document: gql`
          subscription {
            Chat(filter: { mutation_in: [CREATED] }) {
              node {
                id
                from
                content
                createdAt
              }
            }
          }
        `,
        updateQuery: (previous, { subscriptionData }) => {
          const newChatLinks = [
            ...previous.allChats,
            subscriptionData.data.Chat.node
          ];
          const result = {
            ...previous,
            allChats: newChatLinks
          };
          return result;
        }
      });
  };

  closeModal  = () => {
    this.setState({modalOpen: false})
  }

  saveAndCloseModal = (name, color) => {
    this.setState({from: name, color: color},() => 
      this.setState({modalOpen: false}))
  }
  render() {
    let openModal = () => this.setState({ modalOpen: true })
    const allChats = this.props.allChatsQuery.allChats || [];
        return (
          <div className="">
            <div className="container">
              <h2>All-around good-feeling chat</h2>
              {allChats.map(message => (
                <Chatbox key={message.id} message={message} />
              ))}

              {/* Message content input */}
              <div className="inputContainer">
                <input
                  value={this.state.content}
                  onChange={e => this.setState({ content: e.target.value })}
                  type="text"
                  placeholder="Start typing"
                  onKeyPress={this._createChat}
                />
               {
                this.state.showEmojis ?
                  <span style={styles.emojiPicker} ref={el => (this.emojiPicker = el)}>
                    <Picker onSelect={this.addEmoji} />
                  </span>
               :
                <p style={styles.getEmojiButton} onClick={this.showEmojis} >
                  {String.fromCodePoint(0x1f60a)}
                </p>
               }
             </div>
            </div>
          </div>
           );
            }
}

const styles = {
  getEmojiButton: {
    cssFloat: 'right',
    border: 'none',
    margin: 0,
    cursor: 'pointer',
    position: 'absolute',
    bottom: '-33px',
    background: 'transparent',
    right: '7px',
  },
  emojiPicker: {
   position: 'absolute',
   bottom: 10,
   right: 0,
   cssFloat: 'right',
   marginLeft: '200px',
 }


}
const ALL_CHATS_QUERY = gql`
  query AllChatsQuery {
    allChats {
      id
      createdAt
      from
      content
    }
  }
`;

const CREATE_CHAT_MUTATION = gql`
  mutation CreateChatMutation($content: String!, $from: String!) {
    createChat(content: $content, from: $from) {
      id
      createdAt
      from
      content
    }
  }
`;

export default compose(
      graphql(ALL_CHATS_QUERY, { name: 'allChatsQuery' }),
      graphql(CREATE_CHAT_MUTATION, { name: 'createChatMutation' })
    )(App);