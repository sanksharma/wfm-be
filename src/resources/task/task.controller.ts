import { Request, Response } from "express";
import AWS from "aws-sdk";
import webpush, { WebPushError } from "web-push";

type Task = {
  id: number;
  desc: string;
  dueDate: string;
  assignee: {
    name: string;
  };
  status: string;
};

type RequestTask = Omit<Task, "id">;

const initialTasks: Task[] = [
  {
    id: 1,
    desc: "Check expiry date of products in Aisle S-002",
    dueDate: "2023-06-10",
    assignee: {
      name: "Jonathan Smith",
    },
    status: "COMPLETED",
  },
  {
    id: 2,
    desc: "Restock products in Aisle B-1011",
    dueDate: "2023-07-01",
    assignee: {
      name: "John Miller",
    },

    status: "INCOMPLETE",
  },
  {
    id: 3,
    desc: "Move products from Aisle S-001 to Aisle B-1011",
    dueDate: "2023-06-17",
    assignee: {
      name: "Martin Roberts",
    },
    status: "COMPLETED",
  },
  {
    id: 4,
    desc: "Collect nearing expiry products from Aisle A-242 and place in promo zone",
    dueDate: "2023-06-20",
    assignee: {
      name: "Ethan K",
    },

    status: "INCOMPLETE",
  },
];

let tasks = [...initialTasks];

export const getMany = (_request: Request, response: Response) => {
  return response.status(200).json({
    tasks,
  });
};

export const createOne = (request: Request, response: Response) => {
  const task: RequestTask = request.body;

  tasks.push({
    ...task,
    id: tasks.length + 1,
  });

  const SNS = new AWS.SNS();
  const gcmPayload = {
    notification: {
      title: "Task Created",
      body: task.desc,
      android_channel_id: "2",
      data: {
        task,
      },
    },
  };

  const message = {
    GCM: JSON.stringify(gcmPayload),
    default:
      '{  "notification": { "title": "Task Created", "body": "A new task was created." }  }',
  };

  SNS.publish(
    {
      TopicArn: "arn:aws:sns:ap-south-1:322794129073:wfm-standard",
      MessageStructure: "json",
      Message: JSON.stringify(message),
    },
    (err, data) => {
      console.error("err", err);
      console.log("res", data);
    }
  );

  response.status(200).json({ task });
};

export const updateOne = (request: Request, response: Response) => {
  const taskId = request.body.taskId as unknown;

  if (typeof taskId !== "number") {
    return response.status(400).json({ error: "Please pass the task id." });
  }

  const idx = tasks.findIndex((task) => task.id === taskId);

  if (idx === -1) {
    return response
      .status(400)
      .json({ error: "Please enter a valid task id." });
  }

  const task = tasks[idx];
  let status: string;

  if (task.status === "INCOMPLETE") {
    status = "COMPLETED";
  } else {
    status = "INCOMPLETE";
  }

  const updatedTask = {
    ...task,
    status,
  };

  tasks[idx] = updatedTask;

  return response.status(200).json({ task: updatedTask });
};

export const reset = (request: Request, response: Response) => {
  tasks = [...initialTasks];

  return response.status(200).json({ tasks });
};

export const notify = async (request: Request, response: Response) => {
  const { subscription, checked } = request.body;

  const notificationPayload = JSON.stringify({
    notification: {
      title: "New Message",
      body: `${checked ? "Task marked Done!" : "Task marked Pending!"}`,
      icon: "/path/to/icon.png",
    },
  });

  const vapidKeys = {
    publicKey:
      "BBZ-_LjVst1ZWLQQYIdLGBs4Ez_ApbNCQnOanFDBoT1AbJhYq7RovyWoo4BcJe8PCcswcCjwLckJ_1JSza-Ebfc",
    privateKey: "pkytmRATUvrM-JnjvLGkDUZ9L5MbyIjoEmIHe-oMUxo",
  };

  webpush.setVapidDetails(
    "mailto:jnarang@deloitte.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  try {
    const sendResult = await webpush.sendNotification(
      subscription,
      notificationPayload
    );

    console.log(">>>", sendResult);

    return response
      .status(200)
      .json({ message: "Notification sent successfully." });
  } catch (error) {
    if (error instanceof WebPushError) {
      return response.status(error.statusCode).json({ message: error.body });
    }

    console.error("generic catch all error", error);

    return response.status(500).json({ message: "Something went wrong. " });
  }
};
