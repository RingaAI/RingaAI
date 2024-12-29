import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { createLogger } from '../../utils/logger.js';
import { TwitterApi } from '../../services/twitter/client.js';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { AIMessage } from '@langchain/core/messages';

const logger = createLogger('fetch-timeline-tool');

export const createFetchMyRecentTweetsTool = (twitterApi: TwitterApi) =>
  new DynamicStructuredTool({
    name: 'fetch_my_recent_tweets',
    description: 'Fetch the recent tweets of the user',
    schema: z.object({}),
    func: async () => {
      try {
        const myRecentTweets = await twitterApi.getMyRecentTweets(10);

        return {
          tweets: myRecentTweets,
        };
      } catch (error) {
        logger.error('Error in fetchTimelineTool:', error);
        return {
          tweets: [],
        };
      }
    },
  });

export const invokeFetchMyRecentTweetsTool = async (toolNode: ToolNode) => {
  const toolResponse = await toolNode.invoke({
    messages: [
      new AIMessage({
        content: '',
        tool_calls: [
          {
            name: 'fetch_timeline',
            args: {},
            id: 'fetch_timeline_call',
            type: 'tool_call',
          },
        ],
      }),
    ],
  });
  return toolResponse;
};
