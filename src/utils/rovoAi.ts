export const generateAiDescription = (title: string, type: string): {
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
} => {
  const t = title.toLowerCase().trim();
  
  if (!t) {
    return {
      description: "Rovo AI Warning: Please write a title first so that I can analyze and generate context."
    };
  }

  if (type === 'bug') {
    if (t.includes('cors') || t.includes('headers') || t.includes('api') || t.includes('fetch')) {
      return {
        description: `🤖 Rovo AI Analysis:
A network boundary error was detected when communicating with the downstream API gateway. The response payload headers lack the required Access-Control-Allow-Origin parameters, preventing the browser client from reading the response.

Security Context: Preflight OPTIONS request passes but subsequent request gets rejected.`,
        stepsToReproduce: `1. Open web browser developer console.\n2. Trigger the network API call: "${title}".\n3. Look at developer tool Network tab.`,
        expectedBehavior: `Response includes Access-Control-Allow-Origin header matching the origin host, returning 200 OK status.`,
        actualBehavior: `Browser blocks the request with a CORS policy error console log.`
      };
    }
    if (t.includes('auth') || t.includes('login') || t.includes('oauth') || t.includes('token')) {
      return {
        description: `🤖 Rovo AI Analysis:
The authentication middleware fails to decode the incoming state parameter during the redirect handshake. This causes the session context provider to reject authorization, redirecting the user back to the splash page.`,
        stepsToReproduce: `1. Click login button.\n2. Redirect to auth provider.\n3. Enter credentials and click submit.\n4. Observe app looping back to login page.`,
        expectedBehavior: `Token validation succeeds, writes JWT cookie, and redirects user to active dashboard space.`,
        actualBehavior: `JWT validation throws Invalid Token Exception, session context is set to unauthenticated.`
      };
    }
    if (t.includes('checkout') || t.includes('payment') || t.includes('buy') || t.includes('cart')) {
      return {
        description: `🤖 Rovo AI Analysis:
The checkout processing pipeline encountered a state synchronization mismatch. When dispatching checkout events, the order total validation handler throws a 422 Unprocessable Entity error because of coupon discount rounding differences between client and backend.`,
        stepsToReproduce: `1. Add item to cart.\n2. Apply discount code.\n3. Click pay.\n4. Order processing spinner hangs indefinitely.`,
        expectedBehavior: `Dispatches charge request to payment processor, clears cart, and routes to order confirmation page.`,
        actualBehavior: `Order pipeline gets stuck in pending transaction validation state.`
      };
    }
    // Generic Bug
    return {
      description: `🤖 Rovo AI Analysis:
This defect represents a functional regression regarding: "${title}". Initial assessment suggests checking recent commits in related UI/Backend components.`,
      stepsToReproduce: `1. Open the app.\n2. Navigate to the page containing "${title}".\n3. Trigger the actions associated with the issue.`,
      expectedBehavior: `Feature executes cleanly without exceptions.`,
      actualBehavior: `The action encounters an unexpected behavior or crash.`
    };
  } else {
    // Story or Task
    if (t.includes('write') || t.includes('test') || t.includes('playwright') || t.includes('cypress')) {
      return {
        description: `🤖 Rovo AI Scope of Work:
1. Define test fixtures and authentication helper configurations.
2. Code end-to-end integration scenarios for: "${title}".
3. Configure GitHub actions or CI run triggers to run tests on staging deployments.
4. Verify assertions and mock states in dashboard workspaces.`
      };
    }
    if (t.includes('style') || t.includes('css') || t.includes('ui') || t.includes('design') || t.includes('theme')) {
      return {
        description: `🤖 Rovo AI Scope of Work:
1. Review Figma design specs for: "${title}".
2. Implement custom styling properties inside index.css and related component styles.
3. Verify mobile responsiveness and cross-browser layouts.
4. Ensure dark mode styles are compliant with contrast requirements.`
      };
    }
    return {
      description: `🤖 Rovo AI Scope of Work:
This task covers implementing: "${title}".
- Research requirement criteria and constraints.
- Code changes and integrate with active project state.
- Create unit tests verifying correctness.
- Open PR and request team peer review.`
    };
  }
};
