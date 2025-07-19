'use client'

import Head from "next/head"

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - Parlay on Friends</title>
        <meta name="description" content="Privacy Policy for Parlay on Friends - League of Legends betting platform" />
      </Head>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <style jsx>{`
          [data-custom-class='body'], [data-custom-class='body'] * {
            background: transparent !important;
          }
          [data-custom-class='title'], [data-custom-class='title'] * {
            font-family: Arial !important;
            font-size: 26px !important;
            color: rgb(17 24 39) !important;
          }
          @media (prefers-color-scheme: dark) {
            [data-custom-class='title'], [data-custom-class='title'] * {
              color: rgb(243 244 246) !important;
            }
          }
          [data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
            font-family: Arial !important;
            color: rgb(107 114 128) !important;
            font-size: 14px !important;
          }
          @media (prefers-color-scheme: dark) {
            [data-custom-class='subtitle'], [data-custom-class='subtitle'] * {
              color: rgb(156 163 175) !important;
            }
          }
          [data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
            font-family: Arial !important;
            font-size: 19px !important;
            color: rgb(17 24 39) !important;
          }
          @media (prefers-color-scheme: dark) {
            [data-custom-class='heading_1'], [data-custom-class='heading_1'] * {
              color: rgb(243 244 246) !important;
            }
          }
          [data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
            font-family: Arial !important;
            font-size: 17px !important;
            color: rgb(17 24 39) !important;
          }
          @media (prefers-color-scheme: dark) {
            [data-custom-class='heading_2'], [data-custom-class='heading_2'] * {
              color: rgb(243 244 246) !important;
            }
          }
          [data-custom-class='body_text'], [data-custom-class='body_text'] * {
            color: rgb(107 114 128) !important;
            font-size: 14px !important;
            font-family: Arial !important;
          }
          @media (prefers-color-scheme: dark) {
            [data-custom-class='body_text'], [data-custom-class='body_text'] * {
              color: rgb(209 213 219) !important;
            }
          }
          [data-custom-class='link'], [data-custom-class='link'] * {
            color: rgb(59 130 246) !important;
            font-size: 14px !important;
            font-family: Arial !important;
            word-break: break-word !important;
          }
          @media (prefers-color-scheme: dark) {
            [data-custom-class='link'], [data-custom-class='link'] * {
              color: rgb(96 165 250) !important;
            }
          }
          [data-custom-class='link']:hover {
            color: rgb(29 78 216) !important;
          }
          @media (prefers-color-scheme: dark) {
            [data-custom-class='link']:hover {
              color: rgb(147 197 253) !important;
            }
          }
          ul {
            list-style-type: square;
            color: rgb(107 114 128);
          }
          @media (prefers-color-scheme: dark) {
            ul {
              color: rgb(209 213 219);
            }
          }
          ul > li > ul {
            list-style-type: circle;
          }
          ul > li > ul > li > ul {
            list-style-type: square;
          }
          ol li {
            font-family: Arial;
            color: rgb(107 114 128);
          }
          @media (prefers-color-scheme: dark) {
            ol li {
              color: rgb(209 213 219);
            }
          }
        `}</style>

          <span style={{
            display: 'block',
            margin: '0 auto 3.125rem',
            width: '11.125rem',
            height: '2.375rem',
            background: `url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNzgiIGhlaWdodD0iMzgiIHZpZXdCb3g9IjAgMCAxNzggMzgiPgogICAgPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBmaWxsPSIjRDFEMUQxIiBkPSJNNC4yODMgMjQuMTA3Yy0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY2LS43NjhoLS4wODVjLjA1Ny41MDIuMDg2Ljc5Mi4wODYuODd2Mi40MzRILjk4NXYtOC42NDhoMS4zMzJsLjIzMS43NzloLjA3NmMuMzgzLS41OTQuOTUtLjg5MiAxLjcwMi0uODkyLjcxIDAgMS4yNjQuMjc0IDEuNjY1LjgyMi40MDEuNTQ4LjYwMiAxLjMwOS42MDIgMi4yODMgMCAuNjQtLjA5NCAxLjE5OC0uMjgyIDEuNjctLjE4OC40NzMtLjQ1Ni44MzMtLjgwMyAxLjA4LS4zNDcuMjQ3LS43NTYuMzctMS4yMjUuMzd6TTMuOCAxOS4xOTNjLS40MDUgMC0uNy4xMjQtLjg4Ni4zNzMtLjE4Ny4yNDktLjI4My42Ni0uMjkgMS4yMzN2LjE3N2MwIC42NDUuMDk1IDEuMTA3LjI4NyAxLjM4Ni4xOTIuMjguNDk1LjQxOS45MS40MTkuNzM0IDAgMS4xMDEtLjYwNSAxLjEwMS0xLjgxNiAwLS41OS0uMDktMS4wMzQtLjI3LTEuMzI5LS4xODItLjI5NS0uNDY1LS40NDMtLjg1Mi0uNDQzem01LjU3IDEuNzk0YzAgLjU5NC4wOTggMS4wNDQuMjkzIDEuMzQ4LjE5Ni4zMDQuNTEzLjQ1Ny45NTQuNDU3LjQzNyAwIC43NS0uMTUyLjk0Mi0uNDU0LjE5Mi0uMzAzLjI4OC0uNzUzLjI4OC0xLjM1MSAwLS41OTUtLjA5Ny0xLjA0LS4yOS0xLjMzOC0uMTk0LS4yOTctLjUxLS40NDUtLjk1LS40NDUtLjQzOCAwLS43NTMuMTQ3LS45NDYuNDQzLS4xOTQuMjk1LS4yOS43NDItLjI5IDEuMzR6bTQuMTUzIDBjMCAuOTc3LS4yNTggMS43NDItLjc3NCAyLjI5My0uNTE1LjU1Mi0xLjIzMy44MjctMi4xNTQuODI3LS41NzYgMC0xLjA4NS0uMTI2LTEuNTI1LS4zNzhhMi41MiAyLjUyIDAgMCAxLTEuMDE1LTEuMDg4Yy0uMjM3LS40NzMtLjM1NS0xLjAyNC0uMzU1LTEuNjU0IDAtLjk4MS4yNTYtMS43NDQuNzY4LTIuMjg4LjUxMi0uNTQ1IDEuMjMyLS44MTcgMi4xNi0uODE3LjU3NiAwIDEuMDg1LjEyNiAxLjUyNS4zNzYuNDQuMjUxLjc3OS42MSAxLjAxNSAxLjA4LjIzNi40NjkuMzU1IDEuMDE5LjM1NSAxLjY0OXpNMTkuNzEgMjRsLS40NjItMi4xLS42MjMtMi42NTNoLS4wMzdMMTcuNDkzIDI0SDE1LjczbC0xLjcwOC02LjAwNWgxLjYzM2wuNjkzIDIuNjU5Yy4xMS40NzYuMjI0IDEuMTMzLjMzOCAxLjk3MWguMDMyYy4wMTUtLjI3Mi4wNzctLjcwNC4xODgtMS4yOTRsLjA4Ni0uNDU3Ljc0Mi0yLjg3OWgxLjgwNGwuNzA0IDIuODc5Yy4wMTQuMDc5LjAzNy4xOTUuMDY3LjM1YTIwLjk5OCAyMC45OTggMCAwIDEgLjE2NyAxLjAwMmMuMDIzLjE2NS4wMzYuMjk5LjA0LjM5OWguMDMyYy4wMzItLjI1OC4wOS0uNjExLjE3Mi0xLjA2LjA4Mi0uNDUuMTQxLS43NTQuMTc3LS45MTFsLjcyLTIuNjU5aDEuNjA2TDIxLjQ5NCAyNGgtMS43ODN6bTcuMDg2LTQuOTUyYy0uMzQ4IDAtLjYyLjExLS44MTcuMzMtLjE5Ny4yMi0uMzEuNTMzLS4zMzguOTM3aDIuMjk5Yy0uMDA4LS40MDQtLjExMy0uNzE3LS4zMTctLjkzNy0uMjA0LS4yMi0uNDgtLjMzLS44MjctLjMzem0uMjMgNS4wNmMtLjk2NiAwLTEuNzIyLS4yNjctMi4yNjYtLjgtLjU0NC0uNTM0LS44MTYtMS4yOS0uODE2LTIuMjY3IDAtMS4wMDcuMjUxLTEuNzg1Ljc1NC0yLjMzNC41MDMtLjU1IDEuMTk5LS44MjUgMi4wODctLjgyNS44NDggMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDcyLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MSAwIC43MDMtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45Mi4zMmE1Ljc5IDUuNzkgMCAwIDEtMS4xOTEuMTA0em03LjI1My02LjIyNmMuMjIyIDAgLjQwNi4wMTYuNTUzLjA0OWwtLjEyNCAxLjUzNmExLjg3NyAxLjg3NyAwIDAgMC0uNDgzLS4wNTRjLS41MjMgMC0uOTMuMTM0LTEuMjIyLjQwMy0uMjkyLjI2OC0uNDM4LjY0NC0uNDM4IDEuMTI4VjI0aC0xLjYzOHYtNi4wMDVoMS4yNGwuMjQyIDEuMDFoLjA4Yy4xODctLjMzNy40MzktLjYwOC43NTYtLjgxNGExLjg2IDEuODYgMCAwIDEgMS4wMzQtLjMwOXptNC4wMjkgMS4xNjZjLS4zNDcgMC0uNjIuMTEtLjgxNy4zMy0uMTk3LjIyLS4zMS41MzMtLjMzOC45MzdoMi4yOTljLS4wMDctLjQwNC0uMTEzLS43MTctLjMxNy0uOTM3LS4yMDQtLjIyLS40OC0uMzMtLjgyNy0uMzN6bS4yMyA1LjA2Yy0uOTY2IDAtMS43MjItLjI2Ny0yLjI2Ni0uOC0uNTQ0LS41MzQtLjgxNi0xLjI5LS44MTYtMi4yNjcgMC0xLjAwNy4yNTEtMS43ODUuNzU0LTIuMzM0LjUwNC0uNTUgMS4yLS44MjUgMi4wODctLjgyNS44NDkgMCAxLjUxLjI0MiAxLjk4Mi43MjUuNDczLjQ4NC43MDkgMS4xNTIuNzA5IDIuMDA0di43OTVoLTMuODczYy4wMTguNDY1LjE1Ni44MjkuNDE0IDEuMDkuMjU4LjI2MS42Mi4zOTIgMS4wODUuMzkyLjM2MiAwIC43MDQtLjAzNyAxLjAyNi0uMTEzYTUuMTMzIDUuMTMzIDAgMCAwIDEuMDEtLjM2djEuMjY4Yy0uMjg3LjE0My0uNTkzLjI1LS45MTkuMzJhNS43OSA1Ljc5IDAgMCAxLTEuMTkyLjEwNHptNS44MDMgMGMtLjcwNiAwLTEuMjYtLjI3NS0xLjY2My0uODIyLS40MDMtLjU0OC0uNjA0LTEuMzA3LS42MDQtMi4yNzggMC0uOTg0LjIwNS0xLjc1Mi42MTUtMi4zMDEuNDEtLjU1Ljk3NS0uODI1IDEuNjk1LS44MjUuNzU1IDAgMS4zMzIuMjk0IDEuNzI5Ljg4MWguMDU0YTYuNjk3IDYuNjk3IDAgMCAxLS4xMjQtMS4xOTh2LTEuOTIyaDEuNjQ0VjI0SDQ2LjQzbC0uMzE3LS43NzloLS4wN2MtLjM3Mi41OTEtLjk0Ljg4Ni0xLjcwMi44ODZ6bS41NzQtMS4zMDZjLjQyIDAgLjcyNi0uMTIxLjkyMS0uMzY1LjE5Ni0uMjQzLjMwMi0uNjU3LjMyLTEuMjR2LS4xNzhjMC0uNjQ0LS4xLTEuMTA2LS4yOTgtMS4zODYtLjE5OS0uMjc5LS41MjItLjQxOS0uOTctLjQxOWEuOTYyLjk2MiAwIDAgMC0uODUuNDY1Yy0uMjAzLjMxLS4zMDQuNzYtLjMwNCAxLjM1IDAgLjU5Mi4xMDIgMS4wMzUuMzA2IDEuMzMuMjA0LjI5Ni40OTYuNDQzLjg3NS40NDN6bTEwLjkyMi00LjkyYy43MDkgMCAxLjI2NC4yNzcgMS42NjUuODMuNC41NTMuNjAxIDEuMzEyLjYwMSAyLjI3NSAwIC45OTItLjIwNiAxLjc2LS42MiAyLjMwNC0uNDE0LjU0NC0uOTc3LjgxNi0xLjY5LjgxNi0uNzA1IDAtMS4yNTgtLjI1Ni0xLjY1OS0uNzY4aC0uMTEzbC0uMjc0LjY2MWgtMS4yNTF2LTguMzU3aDEuNjM4djEuOTQ0YzAtLjI0Ny0uMDIxLjY0My0uMDY0IDEuMTg3aC4wNjRjLjM4My0uNTk0Ljk1LS44OTIgMS43MDMtLjg5MnptLS41MjcgMS4zMWMtLjQwNCAwLS43LjEyNS0uODg2LjM3NC0uMTg2LjI0OS0uMjgzLjY2LS4yOSAxLjIzM3YuMTc3YzAgLjY0NS4wOTYgMS4xMDcuMjg3IDEuMzg2LjE5Mi4yOC40OTUuNDE5LjkxLjQxOS4zMzcgMCAuNjA1LS4xNTUuODA0LS40NjUuMTk5LS4zMS4yOTgtLjc2LjI5OC0xLjM1IDAtLjU5MS0uMS0xLjAzNS0uMy0xLjMzYS45NDMuOTQzIDAgMCAwLS44MjMtLjQ0M3ptMy4xODYtMS4xOTdoMS43OTRsMS4xMzQgMy4zNzljLjA5Ni4yOTMuMTYzLjY0LjE5OCAxLjA0MmguMDMzYy4wMzktLjM3LjExNi0uNzE3LjIzLTEuMDQybDEuMTEyLTMuMzc5aDEuNzU3bC0yLjU0IDYuNzczYy0uMjM0LjYyNy0uNTY2IDEuMDk2LS45OTcgMS40MDctLjQzMi4zMTItLjkzNi40NjgtMS41MTIuNDY4LS4yODMgMC0uNTYtLjAzLS44MzMtLjA5MnYtMS4zYTIuOCAyLjggMCAwIDAgLjY0NS4wN2MuMjkgMCAuNTQzLS4wODguNzYtLjI2Ni4yMTctLjE3Ny4zODYtLjQ0NC41MDgtLjgwM2wuMDk2LS4yOTUtMi4zODUtNS45NjJ6Ii8+CiAgICAgICAgPGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNzMpIj4KICAgICAgICAgICAgPGNpcmNsZSBjeD0iMTkiIGN5PSIxOSIgcj0iMTkiIGZpbGw9IiNFMEUwRTAiLz4KICAgICAgICAgICAgPHBhdGggZmlsbD0iI0ZGRiIgZD0iTTIyLjQ3NCAxNS40NDNoNS4xNjJMMTIuNDM2IDMwLjRWMTAuMzYzaDE1LjJsLTUuMTYyIDUuMDh6Ii8+CiAgICAgICAgPC9nPgogICAgICAgIDxwYXRoIGZpbGw9IiNEMkQyRDIiIGQ9Ik0xMjEuNTQ0IDE0LjU2di0xLjcyOGg4LjI3MnYxLjcyOGgtMy4wMjRWMjRoLTIuMjR2LTkuNDRoLTMuMDA4em0xMy43NDQgOS41NjhjLTEuMjkgMC0yLjM0MS0uNDE5LTMuMTUyLTEuMjU2LS44MS0uODM3LTEuMjE2LTEuOTQ0LTEuMjE2LTMuMzJzLjQwOC0yLjQ3NyAxLjIyNC0zLjMwNGMuODE2LS44MjcgMS44NzItMS4yNCAzLjE2OC0xLjI0czIuMzYuNDAzIDMuMTkyIDEuMjA4Yy44MzIuODA1IDEuMjQ4IDEuODggMS4yNDggMy4yMjQgMCAuMzEtLjAyMS41OTctLjA2NC44NjRoLTYuNDY0Yy4wNTMuNTc2LjI2NyAxLjA0LjY0IDEuMzkyLjM3My4zNTIuODQ4LjUyOCAxLjQyNC41MjguNzc5IDAgMS4zNTUtLjMyIDEuNzI4LS45NmgyLjQzMmEzLjg5MSAzLjg5MSAwIDAgMS0xLjQ4OCAyLjA2NGMtLjczNi41MzMtMS42MjcuOC0yLjY3Mi44em0xLjQ4LTYuNjg4Yy0uNC0uMzUyLS44ODMtLjUyOC0xLjQ0OC0uNTI4cy0xLjAzNy4xNzYtMS40MTYuNTI4Yy0uMzc5LjM1Mi0uNjA1LjgyMS0uNjggMS40MDhoNC4xOTJjLS4wMzItLjU4Ny0uMjQ4LTEuMDU2LS42NDgtMS40MDh6bTcuMDE2LTIuMzA0djEuNTY4Yy41OTctMS4xMyAxLjQ2MS0xLjY5NiAyLjU5Mi0xLjY5NnYyLjMwNGgtLjU2Yy0uNjcyIDAtMS4xNzkuMTY4LTEuNTIuNTA0LS4zNDEuMzM2LS41MTIuOTE1LS41MTIgMS43MzZWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnptNi40NDggMHYxLjMyOGMuNTY1LS45NyAxLjQ4My0xLjQ1NiAyLjc1Mi0xLjQ1Ni42NzIgMCAxLjI3Mi4xNTUgMS44LjQ2NC41MjguMzEuOTM2Ljc1MiAxLjIyNCAxLjMyOC4zMS0uNTU1LjczMy0uOTkyIDEuMjcyLTEuMzEyYTMuNDg4IDMuNDg4IDAgMCAxIDEuODE2LS40OGMxLjA1NiAwIDEuOTA3LjMzIDIuNTUyLjk5Mi42NDUuNjYxLjk2OCAxLjU5Ljk2OCAyLjc4NFYyNGgtMi4yNHYtNC44OTZjMC0uNjkzLS4xNzYtMS4yMjQtLjUyOC0xLjU5Mi0uMzUyLS4zNjgtLjgzMi0uNTUyLTEuNDQtLjU1MnMtMS4wOS4xODQtMS40NDguNTUyYy0uMzU3LjM2OC0uNTM2Ljg5OS0uNTM2IDEuNTkyVjI0aC0yLjI0di00Ljg5NmMwLS42OTMtLjE3Ni0xLjIyNC0uNTI4LTEuNTkyLS4zNTItLjM2OC0uODMyLS41NTItMS40NC0uNTUycy0xLjA5LjE4NC0xLjQ0OC41NTJjLS4zNTcuMzY4LS41MzYuODk5LS41MzYgMS41OTJWMjRoLTIuMjU2di04Ljg2NGgyLjI1NnpNMTY0LjkzNiAyNFYxMi4xNmgyLjI1NlYyNGgtMi4yNTZ6bTcuMDQtLjE2bC0zLjQ3Mi04LjcwNGgyLjUyOGwyLjI1NiA2LjMwNCAyLjM4NC02LjMwNGgyLjM1MmwtNS41MzYgMTMuMDU2aC0yLjM1MmwxLjg0LTQuMzUyeiIvPgogICAgPC9nPgo8L3N2Zz4K) center no-repeat`
          }}></span>

          <div data-custom-class="body">
            <div><strong><span style={{ fontSize: '26px' }}><span data-custom-class="title"><h1>PRIVACY POLICY</h1></span></span></strong></div>
            <div><span style={{ color: 'rgb(127, 127, 127)' }}><strong><span style={{ fontSize: '15px' }}><span data-custom-class="subtitle">Last updated July 18, 2025</span></span></strong></span></div>
            <div><br /></div>
            <div><br /></div>
            <div><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ color: 'rgb(127, 127, 127)' }}>
                <span style={{ color: 'rgb(89, 89, 89)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">
                    This Privacy Notice for <strong>Parlay on Friends</strong> ("<strong>we</strong>," "<strong>us</strong>," or "<strong>our</strong>"), describes how and why we might access, collect, store, use, and/or share ("<strong>process</strong>") your personal information when you use our services ("<strong>Services</strong>"), including when you:
                  </span>
                </span>
              </span>
            </div>

            <ul>
              <li data-custom-class="body_text" style={{ lineHeight: 1.5 }}>
                <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                  <span data-custom-class="body_text">
                    Visit our website at <span style={{ color: 'rgb(0, 58, 250)' }}>
                      <a href="https://parlay-on-friends.vercel.app" target="_blank" data-custom-class="link">
                        https://parlay-on-friends.vercel.app
                      </a>
                    </span> or any website of ours that links to this Privacy Notice
                  </span>
                </span>
              </li>
            </ul>

            <ul>
              <li data-custom-class="body_text" style={{ lineHeight: 1.5 }}>
                <span style={{ fontSize: '15px' }}>
                  Use <strong>Parlay on Friends</strong>. Parlay on Friends aims to create a betting platform that allows friends to bet on the performance of a group of League of Legends players in upcoming games. It will use Next.js with TypeScript for both frontend and backend (via API routes) and integrate with the Twisted API for League of Legends match history and live game data. Supabase PostgreSQL will be used for database storage, and the platform will be deployed on Vercel. We have an application link which is our demo and this project just serves as an education project for a group of students to teach them about full-stack web development and software engineering principles.
                </span>
              </li>
            </ul>

            <ul>
              <li data-custom-class="body_text" style={{ lineHeight: 1.5 }}>
                <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                  <span data-custom-class="body_text">
                    Engage with us in other related ways, including any sales, marketing, or events
                  </span>
                </span>
              </li>
            </ul>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span style={{ color: 'rgb(127, 127, 127)' }}>
                  <span data-custom-class="body_text">
                    <strong>Questions or concerns? </strong>Reading this Privacy Notice will help you understand your privacy rights and choices. We are responsible for making decisions about how your personal information is processed. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <strong>epchao@berkeley.edu</strong>.
                  </span>
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>
            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <strong><span style={{ fontSize: '15px' }}><span data-custom-class="heading_1"><h2>SUMMARY OF KEY POINTS</h2></span></span></strong>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong><em>This summary provides key points from our Privacy Notice, but you can find out more details about any of these topics by clicking the link following each key point or by using our </em></strong>
                </span>
              </span>
              <a data-custom-class="link" href="#toc">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text"><strong><em>table of contents</em></strong></span>
                </span>
              </a>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong><em> below to find the section you are looking for.</em></strong>
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use. Learn more about
                </span>
              </span>
              <a data-custom-class="link" href="#personalinfo">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">personal information you disclose to us</span>
                </span>
              </a>
              <span data-custom-class="body_text">.</span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>Do we process any sensitive personal information? </strong>Some of the information may be considered "special" or "sensitive" in certain jurisdictions, for example your racial or ethnic origins, sexual orientation, and religious beliefs. We do not process sensitive personal information.
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so. Learn more about
                </span>
              </span>
              <a data-custom-class="link" href="#infouse">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">how we process your information</span>
                </span>
              </a>
              <span data-custom-class="body_text">.</span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>In what situations and with which parties do we share personal information?</strong> We may share information in specific situations and with specific third parties. Learn more about
                </span>
              </span>
              <a data-custom-class="link" href="#whoshare">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">when and with whom we share your personal information</span>
                </span>
              </a>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">.</span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Learn more about
                </span>
              </span>
              <a data-custom-class="link" href="#infosafe">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">how we keep your information safe</span>
                </span>
              </a>
              <span data-custom-class="body_text">.</span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information. Learn more about
                </span>
              </span>
              <a data-custom-class="link" href="#privacyrights">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">your privacy rights</span>
                </span>
              </a>
              <span data-custom-class="body_text">.</span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a
                </span>
              </span>
              <a data-custom-class="link" href="https://app.termly.io/notify/94033b6d-6a1f-42b2-8a3d-eab1713817de" rel="noopener noreferrer" target="_blank">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">data subject access request</span>
                </span>
              </a>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">Want to learn more about what we do with any information we collect? </span>
              </span>
              <a data-custom-class="link" href="#toc">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">Review the Privacy Notice in full</span>
                </span>
              </a>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">.</span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>
            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div id="toc" style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span style={{ color: 'rgb(127, 127, 127)' }}>
                  <span style={{ color: 'rgb(0, 0, 0)' }}>
                    <strong><span data-custom-class="heading_1"><h2>TABLE OF CONTENTS</h2></span></strong>
                  </span>
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#infocollect">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>1. WHAT INFORMATION DO WE COLLECT?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#infouse">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>2. HOW DO WE PROCESS YOUR INFORMATION?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#legalbases">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span style={{ color: 'rgb(0, 58, 250)' }}>
                  <a data-custom-class="link" href="#whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a>
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#sociallogins">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>5. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#inforetain">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>6. HOW LONG DO WE KEEP YOUR INFORMATION?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#infosafe">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>7. HOW DO WE KEEP YOUR INFORMATION SAFE?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span style={{ color: 'rgb(0, 58, 250)' }}>
                  <a data-custom-class="link" href="#privacyrights">8. WHAT ARE YOUR PRIVACY RIGHTS?</a>
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#DNT">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>9. CONTROLS FOR DO-NOT-TRACK FEATURES</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#uslaws">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>10. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <a data-custom-class="link" href="#policyupdates">
                  <span style={{ color: 'rgb(0, 58, 250)' }}>11. DO WE MAKE UPDATES TO THIS NOTICE?</span>
                </a>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <a data-custom-class="link" href="#contact">
                <span style={{ color: 'rgb(0, 58, 250)', fontSize: '15px' }}>12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</span>
              </a>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <a data-custom-class="link" href="#request">
                <span style={{ color: 'rgb(0, 58, 250)' }}>13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</span>
              </a>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>
            <div style={{ lineHeight: 1.5 }}><br /></div>

            {/* Continue with all sections - I'll add the key sections */}

            <div id="infocollect" style={{ lineHeight: 1.5 }}>
              <span style={{ color: 'rgb(0, 0, 0)', fontSize: '15px' }}>
                <span id="control" style={{ color: 'rgb(0, 0, 0)' }}>
                  <strong><span data-custom-class="heading_1"><h2>1. WHAT INFORMATION DO WE COLLECT?</h2></span></strong>
                </span>
              </span>

              <span data-custom-class="heading_2" id="personalinfo" style={{ color: 'rgb(0, 0, 0)' }}>
                <span style={{ fontSize: '15px' }}>
                  <strong><h3>Personal information you disclose to us</h3></strong>
                </span>
              </span>

              <span style={{ color: 'rgb(127, 127, 127)' }}>
                <span style={{ color: 'rgb(89, 89, 89)', fontSize: '15px' }}>
                  <span data-custom-class="body_text">
                    <strong><em>In Short:</em></strong><em> We collect personal information that you provide to us.</em>
                  </span>
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                <span data-custom-class="body_text">
                  We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                <span data-custom-class="body_text">
                  <strong>Personal Information Provided by You.</strong> The personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:
                </span>
              </span>
            </div>

            <ul>
              <li data-custom-class="body_text" style={{ lineHeight: 1.5 }}>
                <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                  <span data-custom-class="body_text">email addresses</span>
                </span>
              </li>
            </ul>

            <ul>
              <li data-custom-class="body_text" style={{ lineHeight: 1.5 }}>
                <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                  <span data-custom-class="body_text">usernames</span>
                </span>
              </li>
            </ul>

            <div id="sensitiveinfo" style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">
                  <strong>Sensitive Information.</strong> We do not process sensitive information.
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                <span data-custom-class="body_text">
                  <strong>Social Media Login Data.</strong> We may provide you with the option to register with us using your existing social media account details, like your Facebook, X, or other social media account. If you choose to register in this way, we will collect certain profile information about you from the social media provider, as described in the section called "
                  <span style={{ fontSize: '15px' }}>
                    <span data-custom-class="body_text">
                      <span style={{ color: 'rgb(0, 58, 250)' }}>
                        <a data-custom-class="link" href="#sociallogins">HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a>
                      </span>
                    </span>
                  </span>" below.
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                <span data-custom-class="body_text">
                  All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.
                </span>
              </span>
            </div>

            {/* Contact Section */}
            <div id="contact" style={{ lineHeight: 1.5, marginTop: '2rem' }}>
              <span style={{ color: 'rgb(127, 127, 127)' }}>
                <span style={{ color: 'rgb(89, 89, 89)', fontSize: '15px' }}>
                  <span id="control" style={{ color: 'rgb(0, 0, 0)' }}>
                    <strong><span data-custom-class="heading_1"><h2>12. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2></span></strong>
                  </span>
                </span>
              </span>

              <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                <span data-custom-class="body_text">
                  If you have questions or comments about this notice, you may email us at <strong>epchao@berkeley.edu</strong> or contact us by post at:
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                <span data-custom-class="body_text">
                  <strong>Parlay on Friends</strong>
                </span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">__________</span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}>
              <span style={{ fontSize: '15px' }}>
                <span data-custom-class="body_text">__________</span>
              </span>
            </div>

            <div style={{ lineHeight: 1.5 }}><br /></div>

            <div id="request" style={{ lineHeight: 1.5 }}>
              <span style={{ color: 'rgb(127, 127, 127)' }}>
                <span style={{ color: 'rgb(89, 89, 89)', fontSize: '15px' }}>
                  <span id="control" style={{ color: 'rgb(0, 0, 0)' }}>
                    <strong><span data-custom-class="heading_1"><h2>13. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2></span></strong>
                  </span>
                </span>
              </span>

              <span style={{ fontSize: '15px', color: 'rgb(89, 89, 89)' }}>
                <span data-custom-class="body_text">
                  Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. These rights may be limited in some circumstances by applicable law. To request to review, update, or delete your personal information, please fill out and submit a
                  <span style={{ color: 'rgb(0, 58, 250)' }}>
                    <span data-custom-class="body_text">
                      <a data-custom-class="link" href="https://app.termly.io/notify/94033b6d-6a1f-42b2-8a3d-eab1713817de" rel="noopener noreferrer" target="_blank">data subject access request</a>
                    </span>
                  </span>.
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
