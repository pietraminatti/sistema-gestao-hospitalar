import { Container } from "@mui/material";
import Hero from "../components/home/Hero.tsx";
import Navbar from "../components/home/Navbar.tsx";

function HomePage() {
  return (
    <Container maxWidth={false} disableGutters={true}>
      <Navbar />
      <Hero />
    </Container>
  );
}

export default HomePage;
