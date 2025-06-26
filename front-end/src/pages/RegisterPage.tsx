import { useFormik } from "formik";
import * as Yup from "yup";
import { Grid2 } from "@mui/material";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Link,
} from "@mui/material";
import { signUp } from "../services/auth/auth";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { ROUTING } from "../constants/routing";
import { ApiError } from "../types";

const validationSchema = Yup.object({
  cpf: Yup.string()
    .required("CPF é obrigatório")
    .matches(/^\d{11}$/, "CPF deve conter 11 dígitos"),
  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
});

export default function RegisterPage() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      cpf: "",
      email: "",
      type: "PACIENTE", // Tipo fixo como paciente
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await signUp(values.cpf, values.email, values.type);

        toast.success(response.data.message);

        setTimeout(() => navigate(ROUTING.LOGIN), 1000);
      } catch (error: unknown) {
        const err = error as ApiError;
        toast.error(err.message);
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          p: 3,
          mt: 4,
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Criar conta
        </Typography>
        <Typography variant="body2" align="center" sx={{ mb: 3 }}>
          Já tem uma conta? <Link href="/login">Entrar</Link>
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="cpf"
                name="cpf"
                label="CPF"
                value={formik.values.cpf}
                onChange={formik.handleChange}
                error={formik.touched.cpf && Boolean(formik.errors.cpf)}
                helperText={formik.touched.cpf && formik.errors.cpf}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="E-mail"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                size="large"
                sx={{ mt: 1 }}
              >
                Registrar e enviar senha por e-mail
              </Button>
            </Grid2>
          </Grid2>
        </form>
      </Box>
    </Container>
  );
}
