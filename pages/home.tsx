import React, { useState, useContext, useEffect } from "react"
import Image from "next/image"
import styles from "../styles/pages/home.module.scss"
import { AuthContext } from "../contexts/AuthContext"
import axios from "../utils/axios"
import Post from "../components/Post"
import SidebarMenu from "../components/SidebarMenu"
import { Button, Message } from "semantic-ui-react"
import { isEmpty } from "../utils/validations"
import InfiniteScroll from "react-infinite-scroller"
import { Loader } from "semantic-ui-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faImage } from "@fortawesome/free-solid-svg-icons"
library.add(faImage)

type Timeline = {
  user_id: number
  username: string
  content: string
  post_image: string
  profile_image: string
  id: number
  liked_count: number
  already_liked: boolean
  commented_count: number
}

export default function Home(): JSX.Element {
  const { authState } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [isDonePosting, setIsDonePosting] = useState(false)
  const [isDoneDeleting, setIsDoneDeleting] = useState(false)
  const [timelines, setTimelines] = useState([])
  const [postInputs, setPostInputs] = useState({
    content: "",
    post_picture: "",
  })
  const [previewImage, setPreviewImage] = useState("")
  const [errors, setErrors] = useState({
    isRequired: {
      content: false,
    },
    disableButtonFlag: true,
  })
  const [hasMore, setHasMore] = useState(true)
  const requiredField = ["content"]
  const defaultNumberOfTimelines = 20
  const defaultPageNumber = 0

  useEffect(() => {
    setIsLoading(authState.isLoading)
    if (!authState.isLoading) {
      getTimelines(authState.user.id)
    }
  }, [authState.isLoading])

  async function getTimelines(
    authUserId: number,
    page: number = defaultPageNumber
  ) {
    let currentPage = page
    if (page > 0) {
      // The page number starts from 0 in backend. So I subtract 1.
      currentPage = page - 1
    }
    await axios
      .post(`/api/get_posts`, {
        auth_user_id: authUserId,
        page: currentPage,
      })
      .then((response: any) => {
        if (response.data.length < defaultNumberOfTimelines) {
          setHasMore(false)
        }
        if (timelines.length === 0) {
          setTimelines(response.data)
          return
        }
        setTimelines(timelines.concat(response.data))
        return
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name
    const value = event.target.value

    errors["isRequired"][name] = false
    if (isEmpty(value) && requiredField.includes(name)) {
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

  function createPost() {
    const authUserId = authState.user.id
    const { content, post_picture } = postInputs
    const formData = new FormData()
    formData.append("post_picture", post_picture)
    formData.append("user_id", authUserId)
    formData.append("content", content)
    axios
      .post(`/api/posts`, formData)
      .then((response: any) => {
        timelines.unshift(response.data)
        setTimelines([...timelines])
        setPostInputs({
          content: "",
          post_picture: "",
        })
        errors["disableButtonFlag"] = true
        setErrors({ ...errors })
        setIsDonePosting(true)
        setPreviewImage("")
        setTimeout(() => setIsDonePosting(false), 2000)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function updatePosts(valueObject: any, postIndex: number) {
    Object.keys(valueObject).map(function (key) {
      if (key === "liked_count" || key === "commented_count") {
        return (timelines[postIndex][key] =
          timelines[postIndex][key] + valueObject[key])
      }
      return (timelines[postIndex][key] = valueObject[key])
    })
    setTimelines([...timelines])
  }

  function deletePost(postId: number, postIndex: number) {
    if (!confirm("本当に削除しますか?")) {
      return
    }
    axios
      .delete(`/api/posts/${postId}`)
      .then(() => {
        setIsDoneDeleting(true)
        timelines.splice(postIndex, 1)
        setTimelines([...timelines])
        setTimeout(() => setIsDoneDeleting(false), 2000)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function handleChangeFile(e: React.ChangeEvent<HTMLInputElement>) {
    const { files, name } = e.target
    setPreviewImage(window.URL.createObjectURL(files[0]))
    setPostInputs({
      ...postInputs,
      [name]: files[0],
    })
  }

  const loadMore = (page) => {
    if (timelines.length === 0) {
      return
    }

    const authUserId = authState.user.id
    getTimelines(authUserId, page)
  }

  const loader = (
    <div className="loader" key={0}>
      <Loader active inline />
    </div>
  )

  if (isLoading) {
    return null
  }

  const { content } = postInputs
  const { disableButtonFlag } = errors

  return (
    <div className={styles["home-wrapper"]}>
      <SidebarMenu />
      <div className={styles["timeline-section"]}>
        <div className={styles["create-post"]}>
          {isDonePosting && (
            <Message className={styles["action-message"]}>投稿しました</Message>
          )}
          {isDoneDeleting && (
            <Message className={styles["action-message"]}>
              投稿を削除しました
            </Message>
          )}
          <div>
            <div className={styles["create-post__input-area"]}>
              <input
                className={styles["create-post__input"]}
                type="text"
                name="content"
                value={content}
                placeholder="いまどうしてる？"
                onChange={(e) => handleChange(e)}
              />
              <label>
                <div className={styles["create-post__image-icon-section"]}>
                  <FontAwesomeIcon
                    icon="image"
                    className={styles["create-post__image-icon"]}
                  />
                </div>
                <input
                  type="file"
                  name="post_picture"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => handleChangeFile(e)}
                  style={{ display: "none" }}
                />
              </label>
              {previewImage && (
                <div className={styles["preview-image-section"]}>
                  <Image
                    width={170}
                    height={240}
                    loader={() => previewImage}
                    src={previewImage}
                    alt={"Preview image"}
                  />
                </div>
              )}
            </div>
          </div>
          <Button onClick={createPost} primary disabled={disableButtonFlag}>
            投稿する
          </Button>
        </div>
        <InfiniteScroll loadMore={loadMore} hasMore={hasMore} loader={loader}>
          {timelines.map((timeline: Timeline, postIndex: number) => {
            return (
              <Post
                key={postIndex}
                postIndex={postIndex}
                userId={timeline.user_id}
                postId={timeline.id}
                username={timeline.username}
                postContent={timeline.content}
                postImage={timeline.post_image}
                profileImage={timeline.profile_image}
                likedCount={timeline.liked_count}
                alreadyLiked={timeline.already_liked}
                commentedCount={timeline.commented_count}
                updatePosts={updatePosts}
                deletePost={deletePost}
              />
            )
          })}
        </InfiniteScroll>
      </div>

      <div className={styles["right-section"]}></div>
    </div>
  )
}
