const nock = require('nock')
const _ = require('lodash')

const dbs = require('../../../../lib/dbs')
const removeIfExists = require('../../../helpers/remove-if-exists')
const repoAdded = require('../../../../jobs/github-event/installation_repositories/added')

test('github-event installation_repositories added', async () => {
  const { repositories } = await dbs()

  nock('https://api.github.com')
    .post('/installations/1/access_tokens')
    .reply(200, {
      token: 'secret'
    })
    .get('/rate_limit')
    .reply(200, {})
    .get('/repos/bar/repo1')
    .reply(200, {
      id: 31,
      full_name: 'bar/repo1',
      private: true,
      fork: false,
      has_issues: true
    })
    .get('/repos/bar/repo2')
    .reply(200, {
      id: 32,
      full_name: 'bar/repo2',
      private: false,
      fork: false,
      has_issues: true
    })
  const newJobs = await repoAdded({
    installation: {
      id: 1,
      account: {
        id: 2
      }
    },
    repositories_added: [
      { id: 31, full_name: 'bar/repo1' },
      { id: 32, full_name: 'bar/repo2' }
    ]
  })

  expect(newJobs).toHaveLength(2)

  const repos = await Promise.all([
    repositories.get('31'),
    repositories.get('32')
  ])
  expect(_.uniq(_.map(newJobs, 'data.name'))).toContain('create-initial-branch')

  newJobs.forEach((job, i) => {
    expect(job.data.accountId).toEqual('2')
  })

  const [repo] = repos
  expect(repo._id).toEqual('31')
  expect(repo.enabled).toBeFalsy()
  expect(repo.accountId).toEqual('2')
  expect(repo.fullName).toEqual('bar/repo1')
  expect(repo.private).toBeTruthy()
  expect(repo.fork).toBeFalsy()
  expect(repo.hasIssues).toBeTruthy()
})

afterAll(async () => {
  const { repositories } = await dbs()
  await Promise.all([
    removeIfExists(repositories, '31', '32')
  ])
})
