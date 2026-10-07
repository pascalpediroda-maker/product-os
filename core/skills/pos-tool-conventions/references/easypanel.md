# Easypanel

The Easypanel MCP reads and drives the server that runs the product: its projects, services, builds,
logs and machine load. A mutation there acts on production at once, and a build started at the wrong
moment can take the whole machine down. Copied from a product that deploys this way every day; each
**(observed)** line is a behaviour seen in that use.

---

## 1. The four tools

The server exposes four tools, whatever the panel's version. Every action goes through a named
procedure.

| Tool | Use |
|---|---|
| `search_procedures` | the entry point: search by intent ("list actions", "deploy app service"). It returns each procedure's exact input schema, its `risk` (`query` or `mutation`) and whether it is `destructive`. Never guess a procedure name or an input field |
| `execute_query` | read only: `{ procedure, input }` |
| `execute_mutation` | a mutation that is not destructive |
| `execute_destructive` | a destructive mutation: stop, restart, redeploy, reboot. Check the target first |

## 2. The procedures a product uses

Found through `search_procedures` (observed). Their names may change with the panel's version: search
before each first use in a session.

| Procedure | Risk | What it gives |
|---|---|---|
| `listActions` | query | a service's history of actions (deployments...), with `status` (`done`, `error`, `killed`, or still running) and `description` = the commit message. Input `{ projectName, serviceName, limit, type }` |
| `getAction` | query | one action, with its full `log`: the Docker build, step by step |
| `inspectAppService` | query | a service's configuration and current deployment, its source (GitHub branch, upload, image) and its `commit.sha`. **Returns its environment variables in clear** |
| `listProjectsAndServices` | query | every project and service with its source and `commit.sha`. **Returns the environment variables in clear** |
| `queryServiceLogs` | query | a service's runtime logs, filtered by time, search text, level |
| `getLegacyMonitorSystemStats`, `getAllServicesStats` | query | the machine's and the services' CPU, memory and disk: is the box calm? |
| `deployAppService` | destructive | rebuild and redeploy a service |
| `restartAppService`, `stopAppService` | destructive | restart without rebuild, stop |

**Secrets.** Two of these reads return every environment variable of the service, secrets included,
into the conversation. Call them only when the source or the sha cannot be read another way, never
quote their output, and never copy a value anywhere. A secret that reached a file or a message is a
secret to rotate: say so once.

## 3. Before a push that deploys

A push to the main branch starts a build when the service deploys from GitHub. Two pushes too close
together kill the first build (observed: a push during a build killed it, and production stayed on the
old image).

1. `listActions` on the service, `limit: 3`: an action that is neither `done`, `error` nor `killed` is
   a build in progress. Wait for it.
2. A push by another session less than three minutes ago, on `origin/<main>`, also means a build is
   about to start: wait.
3. The machine is calm: `getLegacyMonitorSystemStats` (load, memory), and none of the product's long
   jobs runs (the product's pivot or memory names them). A build on a small machine during heavy jobs
   saturated it (observed: load 17 on 4 cores, the build killed, every service unreachable for minutes).

## 4. After the push: follow the build to green

Never say "shipped" before this is done.

1. `listActions({ projectName, serviceName, limit: 3 })`: the first line is the deployment of the
   push.
2. `getAction({ id })` reads its log. Repeat until `status` is `done` (green) or `error` / `killed`
   (orange).
3. `done`: read the deployed `commit.sha` and check it is the commit pushed. `done` with an older sha
   means another deployment overwrote the one followed.
4. `error` or `killed`: production still runs the previous image, and nothing says so on screen. Read
   the log's last steps for the cause.

**A killed or orange build of your own push** is relaunched once, without asking, with
`deployAppService`, after checking that the machine is calm and no long job runs (section 3). Never in
a loop: a second failure goes to the owner with the log. Every other destructive call (a restart, a
stop, a deploy of a service you did not push, a reboot) needs the owner's go (`pos-tool-conventions`
rule 6).

**A call that answers "timed out"** may still have started the action: read `listActions` again
before relaunching.

## 5. Each service deploys its own way

Read a service's source in `inspectAppService` before saying how it ships (observed):

- **from GitHub, on push:** the main branch, or another branch (a service deployed from a long-lived
  branch runs code that the main branch does not have; editing it from the main branch reintroduces
  old code);
- **by upload:** an archive the owner uploads; a push does not deploy it;
- **from an image:** a registry tag.

When a push touches several services that build from it, they build at the same time: on a small
machine, relaunch them one by one and check each finishes green before the next (observed).

Never tell the owner to click "Deploy" for a service that deploys on push: the push does it.

## 6. Pre-flight checklist

- [ ] Procedure found with `search_procedures`; its input schema read.
- [ ] Call announced: which procedure, on which project and service, read or mutation.
- [ ] No read that returns environment variables unless nothing else gives the fact; its output never
      quoted.
- [ ] Before a push that deploys: no build running, no push less than three minutes old, machine calm.
- [ ] After the push: build followed to `done` and the sha checked, or the failure reported.
- [ ] Destructive call: your own killed build relaunched once, or the owner's go for anything else.

## Sources

- The server's own tool descriptions and `search_procedures` results, read in a connected session
  (2026-09-30 to 2026-10-07).
- Observed in use on a product that deploys with Easypanel on a 4-core machine, September and October
  2026: a push during a build killed it; a build during heavy jobs saturated the machine; two services
  rebuilding at once made every service unreachable for about five minutes; a deploy call that timed
  out had started; reads returning environment variables in clear.
