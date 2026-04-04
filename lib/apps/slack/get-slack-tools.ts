import { slackAddReaction } from "@/tools/slack-tools/slack-add-reaction"
import { slackCallApi } from "@/tools/slack-tools/slack-call-api"
import { slackSendChannelMessage } from "@/tools/slack-tools/slack-send-channel-message"
import { slackSendDirectMessage } from "@/tools/slack-tools/slack-send-direct-message"

export function createSlackTools() {
  const useSlackApi = process.env.USE_SLACK_API === "true"

  if (!useSlackApi) {
    return []
  }

  return [
    slackCallApi,
    slackSendDirectMessage,
    slackSendChannelMessage,
    slackAddReaction,
  ]
}
