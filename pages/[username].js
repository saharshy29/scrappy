import Link from 'next/link'
import Head from 'next/head'
import Meta from '@hackclub/meta'
import CalendarHeatmap from 'react-calendar-heatmap'
import Icon from '@hackclub/icons'
import Posts from '../components/posts'

const HOST =
  process.env.NODE_ENV === 'development' ? '' : 'https://scrapbook.hackclub.com'

export default ({ profile, heatmap, posts }) => (
  <main className="container">
    <Meta
      as={Head}
      name="Summer Scrapbook"
      title={`@${profile.username}`}
      description={`Follow @${profile.username}’s progress ${
        profile.streakDisplay
          ? `(currently a ${profile.streakCount}-day streak!)`
          : ''
        } making things in the Hack Club community this summer.`}
      image={`https://workshop-cards.hackclub.com/@${
        profile.username
        }.png?brand=Scrapbook${
        profile.avatar ? `&images=${profile.avatar}` : ''
        }${
        profile.streakDisplay
          ? `&caption=${profile.streakCount}-day streak`
          : ''
        }`}
    />
    <link
      rel="stylesheet"
      type="text/css"
      href={
        HOST +
        (profile.css ? `/api/css?url=${profile.css}` : '/themes/default.css')
      }
    />
    <header className="header">
      <div className="header-col-1">
        {/* <Link href="/" passHref>
          <a className="header-back">
            <Icon glyph="view-back" size={24} />
            All scraps
          </a>
        </Link> */}
        {profile.avatar && (
          <img
            src={profile.avatar}
            width={96}
            alt={profile.username}
            className="header-title-avatar"
          />
        )}
        <div>
          <h1 className="header-title-name">{profile.username}</h1>
          <section className="header-content">
            {profile.streakDisplay && (
              <span
                className={`badge header-streak header-streak-${
                  profile.streakCount !== 1 ? 'plural' : 'singular'
                  }`}
              >
                {profile.streakCount}
              </span>
            )}
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                className="header-link header-link-github"
              >
                <Icon size={32} glyph="github" />
              </a>
            )
            }
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                className="header-link header-link-website"
              >
                <Icon size={32} glyph="link" />
              </a>
            )}
          </section>
        </div>
      </div>
      <aside className="header-col-2 header-chart" aria-hidden>
        <CalendarHeatmap
          startDate={new Date('2020-06-09')}
          endDate={new Date('2020-08-09')}
          values={heatmap}
          showWeekdayLabels
          classForValue={val => (val ? `color-${val.count}` : 'color-empty')}
          titleForValue={v => v?.date}
          width={128}
        />
      </aside>
    </header>
    <Posts posts={posts} profile />
    {profile.css && (
      <footer className="css" title="External CSS URL">
        <Icon
          glyph="embed"
          size={32}
          className="css-icon"
          aria-label="Code link icon"
        />
        <a href={profile.css} target="_blank" className="css-link">
          {profile.css}
        </a>
      </footer>
    )}
  </main>
)

export const getStaticPaths = async () => {
  const { getUsernames } = require('./api/usernames')
  const usernames = await getUsernames()
  const paths = usernames.map(username => ({ params: { username } }))
  return { paths, fallback: false }
}

export const getStaticProps = async ({ params }) => {
  const { getProfile, getPosts } = require('./api/users/[username]')
  const profile = await getProfile(params.username)
  const posts = await getPosts(profile)

  const { groupBy } = require('lodash')
  const days = groupBy(posts, p => p.postedAt?.substring(0, 10))
  const heatmap = Object.keys(days).map(date => ({
    date,
    count: days[date].length || 0
  }))

  return { props: { profile, heatmap, posts }, unstable_revalidate: 1 }
}
