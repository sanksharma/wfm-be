import { Request, Response } from "express";
import AWS from "aws-sdk";

const registeredTokens = new Set<string>();

export const createOne = async (request: Request, response: Response) => {
  const SNS = new AWS.SNS();
  const { token } = request.body;

  if (registeredTokens.has(token)) {
    return response.status(200).json({ token });
  }

  const createEndpointResponse = await SNS.createPlatformEndpoint({
    Token: token,
    PlatformApplicationArn:
      "arn:aws:sns:ap-south-1:322794129073:app/GCM/WFM-Cap-Poc",
  }).promise();

  if (createEndpointResponse.$response.error) {
    return response
      .status(400)
      .json({ error: createEndpointResponse.$response.error });
  }

  createEndpointResponse.EndpointArn;

  const subscribeResponse = await SNS.subscribe({
    TopicArn: "arn:aws:sns:ap-south-1:322794129073:wfm-standard",
    Endpoint: createEndpointResponse.EndpointArn,
    Protocol: "application",
  }).promise();

  if (subscribeResponse.$response.error) {
    return response
      .status(400)
      .json({ error: subscribeResponse.$response.error });
  }

  registeredTokens.add(token);

  return response.status(200).json({ token });
};
