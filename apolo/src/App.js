import "./styles.css";
import LabTabs from "./component/LabTabs";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

// Create Apollo Client
const client = new ApolloClient({
  uri: "http://localhost:8082/graphql",
  cache: new InMemoryCache(),
});
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <ApolloProvider client={client}>
        <LabTabs />
      </ApolloProvider>
    </div>
  );
}
