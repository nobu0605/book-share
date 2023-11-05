import React, { useState, useEffect } from "react"
import styles from "../styles/pages/mypage/[id]/index.module.scss"
import axios from "../utils/axios"
import { library } from "@fortawesome/fontawesome-svg-core"
import { AxiosResponse } from "axios"

import ActionCable from "actioncable"
import { faTimesCircle, faCamera } from "@fortawesome/free-solid-svg-icons"
library.add(faTimesCircle, faCamera)

type MessageObj = {
  id: number
  user_id: number
  room_id: number
  content: string
}

type Message = {
  sender: string
  body: MessageObj
}

export default function MessagePage(): JSX.Element {
  const [messages, setMessages] = useState<MessageObj[]>([])
  const [receivedMessage, setReceivedMessage] = useState<Message>()
  const [text, setText] = useState("")
  const [input, setInput] = useState("")
  const [subscription, setSubscription] = useState<ActionCable.Channel>()
  // Action Cableに接続
  const [cable, setCable] = useState<ActionCable.Cable>()

  console.log("receivedMessage: ", receivedMessage)
  useEffect(() => {
    // ChatChannelをサブスクライブ
    // receivedにメッセージを受信した時のメソッドを設定します。
    // 今回はreceivedMessageにメッセージをセットします。

    if (cable) {
      const sub = cable.subscriptions.create(
        { channel: "RoomChannel" },
        {
          received: (msg) => setReceivedMessage(msg),
        }
      )

      console.log("sub: ", sub)
      setSubscription(sub)
    }
  }, [cable])

  const handleSend = () => {
    // inputをサーバーに送信
    subscription?.perform("speak", { body: input })
    setInput("")
  }

  useEffect(() => {
    if (!receivedMessage) return

    const { body } = receivedMessage
    setMessages([...messages, body])
  }, [receivedMessage])

  useEffect(() => {
    const history = document.getElementById("history")
    history?.scrollTo(0, history.scrollHeight)
  }, [text])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCable(() => ActionCable.createConsumer("ws://localhost:3000/cable"))
    }
    getMessages()
  }, [])

  const onChangeInput = (e) => {
    setInput(e.currentTarget.value)
  }

  async function getMessages() {
    await axios
      .get(`/api/get_messages`)
      .then((response: AxiosResponse<MessageObj[]>) => {
        setMessages(response.data)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  return (
    <div className={styles["mypage-wrapper"]}>
      {/* <SidebarMenu /> */}

      <div className={styles["right-section"]}>
        {/* <div>
          <textarea
            id="history"
            readOnly
            style={{ width: "500px", height: "200px" }}
            value={text}
          />
        </div> */}
        <div>
          {messages.map((message: MessageObj, i: number) => {
            return (
              <div key={i}>
                <span>{message.content}</span>
              </div>
            )
          })}
          <input
            type="text"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleSend()
              }
            }}
            style={{ width: "400px", marginRight: "10px" }}
            onChange={onChangeInput}
            value={input}
          />
          <button onClick={handleSend} disabled={input === ""}>
            send
          </button>
        </div>
      </div>
    </div>
  )
}
