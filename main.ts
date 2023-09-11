interface Server {
  url: string;
  priority: number;
}

interface Options {
  method: string;
  timeout: number;
}

const fetchWithTimeout = async (url: string, options: Options) => {
  const { timeout = 5000 } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal,
  });
  clearTimeout(id);

  return response;
};

// The JSON array of server URLs and priorities
const serverList: Server[] = [
  {
    url: 'https://does-not-work.perfume.new',
    priority: 1,
  },
  {
    url: 'https://gitlab.com',
    priority: 4,
  },
  {
    url: 'http://app.scnt.me',
    priority: 3,
  },
  {
    url: 'https://offline.scentronix.com',
    priority: 2,
  },
];

// Function to check if a server is online or offline
const checkServerStatus = async (server: Server): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(server.url, {
      method: 'GET',
      timeout: 5000,
    });

    if (response.status >= 200 && response.status < 300) {
      return true; // Server is online
    }
  } catch (error) {
    return false;
  }
  return false;
};

// Function to find the online server with the lowest priority
export const findServer = async (): Promise<Server> => {
  const onlineServerStatues = await Promise.all(
    serverList.map(checkServerStatus)
  );

  const sortedOnlineServers = serverList
    .filter((_, index) => onlineServerStatues[index])
    .sort((a, b) => a.priority - b.priority);

  if (sortedOnlineServers.length) return sortedOnlineServers[0];

  throw new Error('No servers are online.'); // Rejects with an error if no servers are online
};

// const main = async () => {
//   console.log(await findServer());
// };

// main();
