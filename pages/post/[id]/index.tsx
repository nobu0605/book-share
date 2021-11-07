import React, { useEffect, useContext, useState } from "react"
import { AuthContext } from "../../../contexts/AuthContext"
import styles from "../../../styles/pages/post/[id]/index.module.scss"
import { useRouter } from "next/router"
import Image from "next/image"
import axios from "../../../utils/axios"
import { isEmpty } from "../../../utils/validations"
import Comment from "../../../components/Comment"
import UserSection from "../../../components/UserSection"
import SidebarMenu from "../../../components/SidebarMenu"
import CommentModal from "../../../components/CommentModal"
import ProfileImage from "../../../components/ProfileImage"
import { Modal, Message, Dropdown, Button } from "semantic-ui-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CommentType } from "../../../types/comment"
import { PostType } from "../../../types/post"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faChevronUp } from "@fortawesome/free-solid-svg-icons"
import { faTimesCircle, faHeart } from "@fortawesome/free-solid-svg-icons"
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons"
import { faComment as farComment } from "@fortawesome/free-regular-svg-icons"
library.add(faChevronUp, faTimesCircle, faHeart, farHeart, farComment)

export default function PostPage(): JSX.Element {
  const { authState } = useContext(AuthContext)
  const router = useRouter()
  const postId = router.query.id
  const [post, setPost] = useState<PostType>()
  const [postInputs, setPostInputs] = useState({
    content: "",
    post_image: "",
  })
  const [comments, setComments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDoneDeleting, setIsDoneDeleting] = useState(false)
  const [errors, setErrors] = useState({
    isRequired: {
      content: false,
    },
    disableButtonFlag: true,
  })
  const [isOpenEditPostModal, setIsOpenEditPostModal] = useState(false)
  const [isOpenCommentModal, setIsOpenCommentModal] = useState(false)

  useEffect(() => {
    if (!authState.isLoading) {
      getPost()
    }
  }, [authState.isLoading])

  async function getPost() {
    await axios
      .post(`/api/get_post`, {
        post_id: postId,
        auth_user_id: authState.user.id,
      })
      .then((response: any) => {
        setPost(response.data.post)
        setComments(response.data.comments)
        setIsLoading(false)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function deleteComment(commentId: number, commentIndex: number) {
    if (!confirm("本当に削除しますか?")) {
      return
    }
    axios
      .delete(`/api/comments/${commentId}`)
      .then(() => {
        setIsDoneDeleting(true)
        comments.splice(commentIndex, 1)
        setComments([...comments])
        setTimeout(() => setIsDoneDeleting(false), 2000)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function addComment(comment) {
    comments.unshift(comment)
    setComments([...comments])
  }

  function updateComment(valueObject: any, commentIndex: number) {
    Object.keys(valueObject).map(function (key) {
      return (comments[commentIndex][key] = valueObject[key])
    })
    setComments([...comments])
  }

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
    setPostInputs({
      ...postInputs,
      [name]: value,
    })
  }

  function updatePost(valueObject: any) {
    Object.keys(valueObject).map(function (key) {
      if (key === "liked_count" || key === "commented_count") {
        return (post[key] = post[key] + valueObject[key])
      }
      return (post[key] = valueObject[key])
    })
    setPost({ ...post })
  }

  function fetchPost(postId) {
    axios
      .get(`/api/posts/${postId}`)
      .then((response: any) => {
        setPostInputs({
          content: response.data.content,
          post_image: response.data.post_image,
        })
        setIsOpenEditPostModal(true)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function editPost(postId: number) {
    const { content } = postInputs
    axios
      .patch(`/api/posts/${postId}`, {
        content,
      })
      .then(() => {
        updatePost(postInputs)
        setPostInputs({
          content: "",
          post_image: "",
        })
        setIsOpenEditPostModal(false)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function likePost(postId: number) {
    axios
      .post(`/api/likes`, {
        user_id: authState.user.id,
        post_id: postId,
      })
      .then(() => {
        const liked = {
          already_liked: true,
          liked_count: 1,
        }
        updatePost(liked)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function dislikePost(postId: number) {
    axios
      .delete(`/api/likes/${authState.user.id}/${postId}`)
      .then(() => {
        const disliked = {
          already_liked: false,
          liked_count: -1,
        }
        updatePost(disliked)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  if (isLoading) {
    return null
  }

  const { disableButtonFlag } = errors
  const { content } = postInputs
  const {
    user_id,
    username,
    post_image,
    profile_image,
    liked_count,
    already_liked,
    commented_count,
  } = post
  const post_content = post.content
  const post_id = post.id

  return (
    <div className={styles["post-page-wrapper"]}>
      <SidebarMenu />
      <div className={styles["post-section"]}>
        {isDoneDeleting && (
          <Message className={styles["action-message"]}>
            コメントを削除しました
          </Message>
        )}
        <div className={styles["post-wrapper"]}>
          <div className={styles["post-user-section"]}>
            <UserSection username={username} profileImage={profile_image} />
            <div>
              {user_id === authState.user.id && (
                <Dropdown
                  className={styles["post-dropdown"]}
                  text={"..."}
                  icon={null}
                >
                  <Dropdown.Menu>
                    <Dropdown.Item
                      text="投稿を編集"
                      onClick={() => fetchPost(postId)}
                    />
                  </Dropdown.Menu>
                </Dropdown>
              )}
              <Modal
                onClose={() => setIsOpenEditPostModal(false)}
                onOpen={() => setIsOpenEditPostModal(true)}
                open={isOpenEditPostModal}
                closeOnDimmerClick={false}
                size={"tiny"}
              >
                <div className={styles["edit-modal"]}>
                  <div className={styles["edit-modal__circle"]}>
                    <FontAwesomeIcon
                      className={styles["edit-modal__circle-icon"]}
                      icon="times-circle"
                      onClick={() => setIsOpenEditPostModal(false)}
                    />
                  </div>
                  <span className={styles["edit-modal__title"]}>
                    投稿を編集
                  </span>
                  <div className={styles["edit-modal__profile"]}>
                    <ProfileImage profileImage={profile_image} />
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
                    onClick={() => editPost(post_id)}
                    primary
                    disabled={disableButtonFlag}
                  >
                    保存する
                  </Button>
                </div>
              </Modal>
            </div>
          </div>
          <div>
            <span className={styles["post-content"]}>{post_content}</span>
            {post_image && (
              <Image
                width={170}
                height={240}
                src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/post-img/${post_image}`}
                alt={"Post image"}
              />
            )}
            <div>
              <FontAwesomeIcon
                className={styles["comment-icon"]}
                icon={farComment}
                style={{ zIndex: 100 }}
                onClick={() => setIsOpenCommentModal(true)}
              />
              <span
                className={`${styles["count-text"]} ${styles["commented-count"]}`}
              >
                {commented_count}
              </span>
              <CommentModal
                postProfileImage={profile_image}
                postUsername={username}
                postContent={post_content}
                postId={post_id}
                postIndex={0}
                isOpenCommentModal={isOpenCommentModal}
                setIsOpenCommentModal={setIsOpenCommentModal}
                updatePost={updatePost}
                addComment={addComment}
              />
              {already_liked ? (
                <FontAwesomeIcon
                  className={styles["liked-heart"]}
                  icon={faHeart}
                  onClick={() => dislikePost(post_id)}
                />
              ) : (
                <FontAwesomeIcon
                  className={styles["heart"]}
                  icon={farHeart}
                  onClick={() => likePost(post_id)}
                />
              )}
              <span className={styles["count-text"]}>{liked_count}</span>
            </div>
          </div>
        </div>
        <div>
          {comments.length > 0 && (
            <>
              <FontAwesomeIcon
                className={styles["reply-arrow-icon"]}
                icon="chevron-up"
              />
              <br />
              <FontAwesomeIcon
                className={styles["reply-arrow-icon"]}
                icon="chevron-up"
              />
            </>
          )}
          {comments.map((comment: CommentType, index: number) => {
            return (
              <Comment
                key={index}
                postAuthorName={post.username}
                commentIndex={index}
                commentId={comment.id}
                userId={comment.user_id}
                username={comment.username}
                content={comment.content}
                profileImage={comment.profile_image}
                deleteComment={deleteComment}
                updateComment={updateComment}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
