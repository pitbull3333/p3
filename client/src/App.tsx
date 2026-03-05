import { Outlet } from "react-router";
import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/App.css";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Header />
      <main>
        <div className="react-hot-toast">
          <Toaster position="top-right" />
        </div>
        <Outlet />
      </main>
      <NavBar />
    </>
  );
}

export default App;
