import React, { useState, useContext, useEffect } from "react"
import styles from "../styles/pages/home.module.scss"
import { AuthContext } from "../contexts/AuthContext"
import axios from "../utils/axios"
import Post from "../components/Post"
import ProfileImage from "../components/ProfileImage"
import { Button, Message, Dropdown } from "semantic-ui-react"
import { isEmpty } from "../utils/validations"
import Link from "next/link"
import InfiniteScroll from "react-infinite-scroller"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { library } from "@fortawesome/fontawesome-svg-core"
import { faHome } from "@fortawesome/free-solid-svg-icons"
library.add(faHome)

type Timeline = {
  user_id: number
  username: string
  content: string
  post_image: string
  profile_image: string
  id: number
  liked_count: number
  already_liked: boolean
}

export default function Home(): JSX.Element {
  const { authState } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(true)
  const [isDonePosting, setIsDonePosting] = useState(false)
  const [isDoneDeleting, setIsDoneDeleting] = useState(false)
  const [timelines, setTimelines] = useState([])
  const [postInputs, setPostInputs] = useState({
    content: "",
    post_image: "",
  })
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
    const { content, post_image } = postInputs

    axios
      .post(`/api/posts`, {
        user_id: authUserId,
        content,
        post_image,
      })
      .then((response: any) => {
        timelines.unshift(response.data)
        setTimelines([...timelines])
        setPostInputs({
          content: "",
          post_image: "",
        })
        errors["disableButtonFlag"] = true
        setErrors({ ...errors })
        setIsDonePosting(true)
        setTimeout(() => setIsDonePosting(false), 2000)
      })
      .catch((e) => {
        console.error(e)
      })
  }

  function updateTimeline(valueObject: any, postIndex: number) {
    Object.keys(valueObject).map(function (key) {
      if (key === "liked_count") {
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

  function logout(): void {
    localStorage.removeItem("uid")
    localStorage.removeItem("access-token")
    localStorage.removeItem("client")
    location.pathname = "/"
  }

  const loadMore = (page) => {
    const authUserId = authState.user.id
    getTimelines(authUserId, page)
  }

  const loader = (
    <div className="loader" key={0}>
      Loading ...
    </div>
  )

  if (isLoading) {
    return null
  }

  const { username, profile_image } = authState.user
  const { content } = postInputs
  const { disableButtonFlag } = errors

  return (
    <div className={styles["home-wrapper"]}>
      <div className={styles["sidebar-menu"]}>
        <nav className={styles["sidebar-navigation"]}>
          <div
            className={`${styles["sidebar-menu-link"]} ${styles["sidebar-menu-profile"]}`}
          >
            <ProfileImage profileImage={profile_image} />
            <span className={styles["sidebar-menu-profile__name"]}>
              {username}
            </span>
          </div>
          <Link href={`/home`}>
            <a
              className={`${styles["sidebar-menu-link"]} ${styles["sidebar-menu-home-link"]}`}
            >
              <FontAwesomeIcon
                icon="home"
                className={styles["sidebar-menu__home-icon"]}
              />
              <span>ホーム</span>
            </a>
          </Link>
          <Dropdown className={styles["sidebar-menu-link"]} text={"アカウント"}>
            <Dropdown.Menu>
              <Dropdown.Item text="Logout" onClick={logout} />
            </Dropdown.Menu>
          </Dropdown>
        </nav>
      </div>

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
            <input
              className={styles["create-post__input"]}
              type="text"
              name="content"
              value={content}
              placeholder="いまどうしてる？"
              onChange={(e) => handleChange(e)}
            />
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
                updateTimeline={updateTimeline}
                deletePost={deletePost}
              />
            )
          })}
        </InfiniteScroll>
      </div>

      <div className={styles["right-section"]}>
        <p>dummy text dummy text dummy text dummy text dummy text</p>
      </div>
    </div>
  )
}
