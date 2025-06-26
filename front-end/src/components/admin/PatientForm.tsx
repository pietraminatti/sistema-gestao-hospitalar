import React, { useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { User } from "../../types/user";
import { useFormik } from "formik";
import * as Yup from "yup";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";

// Interface que define as props do componente PatientForm
// Permite usar o mesmo formulário para adicionar e editar
interface PatientFormProps {
  open: boolean; // Estado de exibição do modal
  onClose: () => void; // Função para fechar o modal
  onSubmit: (patient: Partial<User>) => void; // Função ao submeter o formulário
  patient?: User | null; // Dados do paciente (ao editar)
  mode: "add" | "edit"; // Modo do formulário: adicionar ou editar
}

// Schema de validação usando Yup
// Define as regras de validação dos dados
const validationSchema = Yup.object({
  firstName: Yup.string()
    .required("Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: Yup.string()
    .required("Sobrenome é obrigatório")
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  sex: Yup.string().oneOf(["male", "female"]).required("Sexo é obrigatório"),
  dob: Yup.date()
    .required("Data de nascimento é obrigatória")
    .max(new Date(), "Data de nascimento não pode ser futura"),
  phone: Yup.string()
    .required("Telefone é obrigatório")
    .matches(/^[0-9]{10,11}$/, "Telefone deve ter 10 ou 11 dígitos"),
  email: Yup.string().required("Email é obrigatório").email("Email inválido"),
  status: Yup.string()
    .oneOf(["active", "inactive"])
    .required("Status é obrigatório"),
});

const PatientForm: React.FC<PatientFormProps> = ({
  open,
  onClose,
  onSubmit,
  patient,
  mode,
}) => {
  // Usa formik para gerenciar o formulário e validação
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      sex: "male",
      dob: new Date().toISOString().split("T")[0],
      phone: "",
      email: "",
      status: "active",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      const submitValues = {
        ...values,
        sex: values.sex === "male",
        status: values.status === "active",
      };
      onSubmit(submitValues);
    },
  });

  // Atualiza valores do formulário ao editar ou reseta ao adicionar
  useEffect(() => {
    if (patient && mode === "edit") {
      formik.setValues({
        firstName: patient.firstName,
        lastName: patient.lastName,
        sex: patient.sex === false ? "female" : "male",
        dob: patient.dob,
        phone: patient.phone,
        email: patient.email,
        status: patient.status === false ? "inactive" : "active",
      });
    } else if (mode === "add") {
      formik.resetForm();
    }
  }, [patient, mode]);

  // Fecha o modal e reseta o formulário
  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Define título e texto do botão conforme o modo
  const title =
    mode === "add"
      ? "Adicionar novo paciente"
      : "Editar informações do paciente";
  const buttonText =
    mode === "add" ? "Adicionar paciente" : "Salvar alterações";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={formik.handleSubmit}>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Formulário de informações do paciente */}
            <Grid item xs={12} md={6}>
              <TextField
                name="firstName"
                label="Nome"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="lastName"
                label="Sobrenome"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                error={formik.touched.sex && Boolean(formik.errors.sex)}
              >
                <InputLabel>Sexo</InputLabel>
                <Select
                  name="sex"
                  value={formik.values.sex}
                  label="Sexo"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="male">Masculino</MenuItem>
                  <MenuItem value="female">Feminino</MenuItem>
                </Select>
                {formik.touched.sex && formik.errors.sex && (
                  <FormHelperText>{formik.errors.sex as string}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={ptBR}
              >
                <DatePicker
                  label="Data de nascimento"
                  value={new Date(formik.values.dob)}
                  onChange={(newValue) => {
                    if (newValue) {
                      const dateStr = newValue.toISOString().split("T")[0];
                      formik.setFieldValue("dob", dateStr);
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.dob && Boolean(formik.errors.dob),
                      helperText:
                        formik.touched.dob && (formik.errors.dob as string),
                      onBlur: () => formik.setFieldTouched("dob", true),
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="phone"
                label="Telefone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                fullWidth
                required
                type="email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl
                fullWidth
                error={formik.touched.status && Boolean(formik.errors.status)}
              >
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formik.values.status}
                  label="Status"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="active">Ativo</MenuItem>
                  <MenuItem value="inactive">Inativo</MenuItem>
                </Select>
                {formik.touched.status && formik.errors.status && (
                  <FormHelperText>
                    {formik.errors.status as string}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="error">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={formik.isSubmitting}
          >
            {buttonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PatientForm;
