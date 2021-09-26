import React, { useState, useContext } from "react"
import styles from "../styles/components/Post.module.scss"
import Image from "next/image"
import ProfileImage from "./ProfileImage"
import { Dropdown } from "semantic-ui-react"
import axios from "../utils/axios"
import { Modal, Button } from "semantic-ui-react"
import { isEmpty } from "../utils/validations"
import { AuthContext } from "../contexts/AuthContext"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTimesCircle, faHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons"
library.add(faTimesCircle, faHeart, farHeart)

type Props = {
  postIndex: number
  userId: number
  postId: number
  username: string
  postContent: string
  postImage: string
  profileImage: string
  likedCount: number
  alreadyLiked: boolean
  deletePost: (authUserId: number, postIndex: number) => void
  updateTimeline: (valueObject: any, postIndex: number) => void
}

export default function Post(props: Props): JSX.Element {
  const { authState } = useContext(AuthContext)
  const authUserId = authState.user.id
  const [editInputs, setEditInputs] = useState({
    content: "",
    post_image: "",
  })
  const [errors, setErrors] = useState({
    isRequired: {
      content: false,
    },
    disableButtonFlag: true,
  })
  const [isOpenModal, setIsOpenModal] = useState(false)

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name
    const value = event.target.value

    errors["isRequired"][name] = false
    if (isEmpty(value)) {
      errors["isRequired"][name] = true
    }

    errors["disableButtonFlag"] = false
    if (Object.values(errors.isRequired).includes(true)) {
      errors["disableButtonFlag"] = true
    }

    setErrors({ ...errors })
    setEditInputs({
      ...editInputs,
      [name]: value,
    })
  }

  async function getPost(postId) {
    await axios
      .get(`/api/posts/${postId}`)
      .then((response: any) => {
        setEditInputs({
          content: response.data.content,
          post_image: response.data.post_image,
        })
        setIsOpenModal(true)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function updatePost(postId: number, postIndex: number) {
    const { content } = editInputs
    axios
      .patch(`/api/posts/${postId}`, {
        content,
      })
      .then(() => {
        props.updateTimeline(editInputs, postIndex)
        setEditInputs({
          content: "",
          post_image: "",
        })
        setIsOpenModal(false)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function likePost(postId: number, postIndex: number) {
    axios
      .post(`/api/likes`, {
        user_id: authUserId,
        post_id: postId,
      })
      .then(() => {
        const liked = {
          already_liked: true,
          liked_count: 1,
        }
        props.updateTimeline(liked, postIndex)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function dislikePost(postId: number, postIndex: number) {
    axios
      .delete(`/api/likes/${authUserId}/${postId}`)
      .then(() => {
        const disliked = {
          already_liked: false,
          liked_count: -1,
        }
        props.updateTimeline(disliked, postIndex)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  const { disableButtonFlag } = errors
  const { content } = editInputs
  const {
    postIndex,
    userId,
    postId,
    postContent,
    postImage,
    username,
    profileImage,
    likedCount,
    alreadyLiked,
  } = props

  return (
    <div className={styles["post-wrapper"]}>
      <div className={styles["post-user-section"]}>
        <div className={styles["post-user-section-left"]}>
          <ProfileImage profileImage={profileImage} />
          <span className={styles["post-user-section__name"]}>{username}</span>
        </div>
        {userId === authUserId && (
          <Dropdown
            className={styles["post-dropdown"]}
            text={"..."}
            icon={null}
          >
            <Dropdown.Menu>
              <Dropdown.Item
                text="投稿を編集"
                onClick={() => getPost(postId)}
              />
              <Dropdown.Item
                text="投稿を削除"
                onClick={() => props.deletePost(postId, postIndex)}
              />
            </Dropdown.Menu>
          </Dropdown>
        )}
        <Modal
          onClose={() => setIsOpenModal(false)}
          onOpen={() => setIsOpenModal(true)}
          open={isOpenModal}
          closeOnDimmerClick={false}
          size={"tiny"}
        >
          <div className={styles["edit-modal"]}>
            <div className={styles["edit-modal__circle"]}>
              <FontAwesomeIcon
                className={styles["edit-modal__circle-icon"]}
                icon="times-circle"
                onClick={() => setIsOpenModal(false)}
              />
            </div>
            <span className={styles["edit-modal__title"]}>投稿を編集</span>
            <div className={styles["edit-modal__profile"]}>
              <ProfileImage profileImage={profileImage} />
              <span className={styles["edit-modal__profile-name"]}>
                {username}
              </span>
            </div>
            <input
              type="text"
              name="content"
              value={content}
              onChange={(e) => handleChange(e)}
              className={styles["edit-modal__input"]}
            />
            <Button
              className={styles["edit-modal__button"]}
              onClick={() => updatePost(postId, postIndex)}
              primary
              disabled={disableButtonFlag}
            >
              保存する
            </Button>
          </div>
        </Modal>
      </div>
      <div>
        <span className={styles["post-content"]}>{postContent}</span>
        {postImage && (
          <Image
            width={170}
            height={240}
            src={`/post-image/${postImage}`}
            alt={"Post image"}
          />
        )}
        <div>
          {alreadyLiked ? (
            <FontAwesomeIcon
              className={styles["liked-heart"]}
              icon={faHeart}
              onClick={() => dislikePost(postId, postIndex)}
            />
          ) : (
            <FontAwesomeIcon
              className={styles["heart"]}
              icon={farHeart}
              onClick={() => likePost(postId, postIndex)}
            />
          )}
          <span className={styles["liked-count"]}>{likedCount}</span>
        </div>
      </div>
    </div>
  )
}
