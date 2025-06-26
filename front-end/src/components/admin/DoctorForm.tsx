import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { vi } from "date-fns/locale";

interface DoctorFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Doctor>) => void;
  doctor: Doctor | null;
  mode: "add" | "edit";
  isSubmitting?: boolean;
}

const DoctorForm: React.FC<DoctorFormProps> = ({
  open,
  onClose,
  onSubmit,
  doctor,
  mode,
  isSubmitting = false,
}) => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loadingDiseases, setLoadingDiseases] = useState<boolean>(false);
  const [errorDiseases, setErrorDiseases] = useState<string | null>(null);

  const [dobError, setDobError] = useState<string | null>(null);

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required("Nome é obrigatório")
      .min(2, "Nome deve ter pelo menos 2 caracteres"),
    lastName: Yup.string()
      .required("Sobrenome é obrigatório")
      .min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
    specialization: Yup.string().required("Especialidade é obrigatória"),
    phone: Yup.string()
      .required("Telefone é obrigatório")
      .matches(/^[0-9]{10,11}$/, "Telefone inválido"),
    email: Yup.string().required("Email é obrigatório").email("Email inválido"),
  });

  useEffect(() => {
    if (open) {
      const fetchDiseases = async () => {
        try {
          setLoadingDiseases(true);
          setErrorDiseases(null);
          const response = await getAllTypeDiseases();
          if (response && response.data) {
            setDiseases(response.data);
          } else {
            setErrorDiseases("Não foi possível carregar a lista de doenças");
          }
        } catch (error) {
          console.error("Erro ao buscar doenças:", error);
          setErrorDiseases("Ocorreu um erro ao carregar a lista de doenças");
        } finally {
          setLoadingDiseases(false);
        }
      };

      fetchDiseases();
    }
  }, [open]);

  const validateDob = (date: Date | null): boolean => {
    if (!date) {
      setDobError("Data de nascimento é obrigatória");
      return false;
    }
    setDobError(null);
    return true;
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isSubmitting}
    >
      <DialogTitle>
        {mode === "add"
          ? "Adicionar novo médico"
          : "Editar informações do médico"}
      </DialogTitle>

      <Formik
        initialValues={{
          firstName: doctor?.firstName || "",
          lastName: doctor?.lastName || "",
          sex: doctor?.sex === false ? "female" : "male",
          dob: doctor?.dob || "",
          phone: doctor?.phone || "",
          email: doctor?.email || "",
          specialization: doctor?.specialization || "",
          status: doctor?.status === false ? "inactive" : "active",
          typeDisease: doctor?.typeDisease || undefined,
        }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => {
          const submitValues: Partial<Doctor> = {
            ...values,
            sex: values.sex === "male",
            status: values.status === "active",
          };
          onSubmit(submitValues);
          actions.setSubmitting(false);
        }}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
          isSubmitting: formikSubmitting,
        }) => {
          const isCurrentlySubmitting = isSubmitting || formikSubmitting;

          return (
            <Form>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Informações básicas
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="firstName"
                        label="Nome"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        error={touched.firstName && Boolean(errors.firstName)}
                        helperText={touched.firstName && errors.firstName}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="lastName"
                        label="Sobrenome"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        error={touched.lastName && Boolean(errors.lastName)}
                        helperText={touched.lastName && errors.lastName}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Sexo</InputLabel>
                        <Select
                          name="sex"
                          value={values.sex}
                          label="Sexo"
                          onChange={(e) => {
                            setFieldValue("sex", e.target.value);
                          }}
                        >
                          <MenuItem value="male">Masculino</MenuItem>
                          <MenuItem value="female">Feminino</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        adapterLocale={vi}
                      >
                        <DatePicker
                          label="Data de nascimento"
                          value={values.dob ? new Date(values.dob) : null}
                          onChange={(date) => {
                            if (date) {
                              setFieldValue(
                                "dob",
                                date.toISOString().split("T")[0]
                              );
                              validateDob(date);
                            }
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!dobError,
                              helperText: dobError,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="phone"
                        label="Telefone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="email"
                        label="Email"
                        type="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Field
                        as={TextField}
                        name="specialization"
                        label="Especialidade"
                        value={values.specialization}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        fullWidth
                        error={
                          touched.specialization &&
                          Boolean(errors.specialization)
                        }
                        helperText={
                          touched.specialization && errors.specialization
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="status"
                          value={values.status}
                          label="Status"
                          onChange={(e) => {
                            setFieldValue("status", e.target.value);
                          }}
                        >
                          <MenuItem value="active">Ativo</MenuItem>
                          <MenuItem value="inactive">Inativo</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth disabled={loadingDiseases}>
                        <InputLabel id="disease-select-label">
                          Tipos de doenças que pode atender
                        </InputLabel>
                        {loadingDiseases ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              pl: 2,
                              pt: 1,
                            }}
                          >
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            <Typography variant="body2" color="textSecondary">
                              Carregando lista de doenças...
                            </Typography>
                          </Box>
                        ) : errorDiseases ? (
                          <Box sx={{ color: "error.main", pl: 2, pt: 1 }}>
                            <Typography variant="body2" color="error">
                              {errorDiseases}
                            </Typography>
                          </Box>
                        ) : (
                          <Select
                            labelId="disease-select-label"
                            value={
                              values.typeDisease?.id ||
                              (diseases.length > 0 ? diseases[0].id : "")
                            }
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const selectedDisease = diseases.find(
                                (disease) => disease.id === selectedId
                              );
                              setFieldValue("typeDisease", selectedDisease);
                            }}
                            label="Tipos de doenças que pode atender"
                          >
                            {diseases.map((disease) => (
                              <MenuItem key={disease.id} value={disease.id}>
                                {disease.name}
                              </MenuItem>
                            ))}
                          </Select>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>

              <DialogActions>
                <Button onClick={handleClose} disabled={isCurrentlySubmitting}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isCurrentlySubmitting}
                  startIcon={
                    isCurrentlySubmitting && (
                      <CircularProgress size={20} color="inherit" />
                    )
                  }
                >
                  {isCurrentlySubmitting
                    ? "Processando..."
                    : mode === "add"
                    ? "Adicionar"
                    : "Salvar alterações"}
                </Button>
              </DialogActions>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default DoctorForm;
