import { MonitorStatus } from '../types';

export interface CheckResult {
  status: MonitorStatus;
  latency: number;
  details: string;
}

/**
 * Simulates a curl check using fetch.
 * Note: In a real browser environment, CORS restricts access to many sites.
 * We use mode: 'no-cors' to detect if a server is reachable (opaque response) 
 * which avoids CORS errors for simple uptime checks, though we can't read the body.
 */
export const checkUptime = async (url: string): Promise<CheckResult> => {
  const start = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

  try {
    // Attempt a fetch. 
    // 'no-cors' allows us to send a request to another origin.
    // If the server receives it and responds (even 404, 500, or 200), the promise resolves (opaque).
    // If the network is down or DNS fails, the promise rejects.
    await fetch(url, {
      method: 'GET',
      mode: 'no-cors', 
      signal: controller.signal,
      cache: 'no-cache',
    });

    const end = performance.now();
    const latency = Math.round(end - start);

    clearTimeout(timeoutId);
    return {
      status: MonitorStatus.UP,
      latency,
      details: `HTTP/1.1 200 OK (Simulated via Opaque Response) - Time: ${latency}ms`
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const end = performance.now();
    
    let errorMessage = "Connection Refused";
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = "Operation Timed Out (5000ms)";
      } else {
        errorMessage = error.message;
      }
    }

    return {
      status: MonitorStatus.DOWN,
      latency: 0,
      details: `curl: (7) Failed to connect to ${url} port 443/80: ${errorMessage}`
    };
  }
};