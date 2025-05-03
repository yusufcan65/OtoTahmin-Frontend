import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  MenuItem,
  Select,
  TextField,
  Button,
  Box,
  Stack,
  Paper,
  InputLabel,
  FormControl,
  CircularProgress
} from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { styled } from "@mui/system";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: "16px",
  width: "100%",
  maxWidth: "600px",
  background: "rgba(255, 255, 255, 0.75)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
}));

const BackgroundWrapper = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(to right, #e0eafc, #cfdef3)", // mavi beyaz degrade
  padding: theme.spacing(2),
}));




function App() {
  const [form, setForm] = useState({
    Marka: "",
    Seri: "",
    Model: "",
    Yıl: 2000,
    Kilometre: 0,
    "Vites Tipi": "Düz",
    "Yakıt Tipi": "Benzin",
    "Kasa Tipi": "Sedan",
    "Motor Hacmi": 0,
    "Motor Gücü": 0,
    "Çekiş": "Önden Çekiş"
  });

  const [veriler, setVeriler] = useState({});
  const [seriler, setSeriler] = useState([]);
  const [modeller, setModeller] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get("https://flask-backend-793109096440.europe-west1.run.app/veri")
      .then((res) => {
        setVeriler(res.data);
      })
      .catch((err) => console.error("Veri çekme hatası:", err));
  }, []);
  

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Marka") {
      setForm((prev) => ({
        ...prev,
        Marka: value,
        Seri: "",
        Model: ""
      }));
      const yeniSeriler = Object.keys(veriler[value] || {});
      setSeriler(yeniSeriler);
      setModeller([]);
    } else if (name === "Seri") {
      setForm((prev) => ({
        ...prev,
        Seri: value,
        Model: ""
      }));
      const yeniModeller = veriler[form.Marka]?.[value] || [];
      setModeller(yeniModeller);
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const predictPrice = async () => {
    setLoading(true);

    const formattedForm = {
      ...form,
      Yıl: Number(form.Yıl),
      Kilometre: Number(form.Kilometre),
      "Motor Hacmi": Number(form["Motor Hacmi"]),
      "Motor Gücü": Number(form["Motor Gücü"])
    };

    try {
      const res = await axios.post("https://flask-backend-793109096440.europe-west1.run.app/predict", formattedForm);
      if (res.data && res.data.tahmin !== undefined) {
        setResult(res.data.tahmin.toLocaleString("tr-TR") + " TL");
      } else {
        setResult("Tahmin yapılamadı.");
      }
    } catch (error) {
      console.error("Tahmin isteğinde hata:", error);
      setResult("Tahmin yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
    <StyledPaper>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <DirectionsCarIcon fontSize="large" color="primary" />
        <Typography variant="h4" fontWeight={650}>OtoTahmin</Typography>
      </Box>
        <Stack spacing={3}>
          {/* Marka */}
          <FormControl fullWidth>
            <InputLabel>Marka</InputLabel>
            <Select
              name="Marka"
              value={form.Marka}
              onChange={handleChange}
              label="Marka"
            >
              {Object.keys(veriler).map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
  
          {/* Seri */}
          {seriler.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Seri</InputLabel>
              <Select
                name="Seri"
                value={form.Seri}
                onChange={handleChange}
                label="Seri"
              >
                {seriler.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
  
          {/* Model */}
          {modeller.length > 0 && (
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select
                name="Model"
                value={form.Model}
                onChange={handleChange}
                label="Model"
              >
                {modeller.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
  
          {/* Sayısal alanlar */}
          {["Yıl", "Kilometre", "Motor Hacmi (cc)", "Motor Gücü (hp)"].map((field) => (
            <TextField
              key={field}
              fullWidth
              type="number"
              name={field}
              label={field}
              value={form[field]}
              onChange={handleChange}
            />
          ))}
  
          {/* Select alanlar */}
          {[
            { name: "Vites Tipi", options: ["Düz", "Yarı Otomatik", "Otomatik"] },
            { name: "Yakıt Tipi", options: ["Benzin", "Dizel", "LPG & Benzin" ,"Elektrik", "Hibrit"] },
            { name: "Kasa Tipi", options: ["Sedan", "Hatchback/5", "Hatchback/3","Pick-up","MPV","Coupe","SUV","Station Vagon"] },
            { name: "Çekiş", options: ["Önden Çekiş", "Arkadan İtiş", "4WD"] }
          ].map(({ name, options }) => (
            <FormControl fullWidth key={name}>
              <InputLabel>{name}</InputLabel>
              <Select
                name={name}
                value={form[name]}
                onChange={handleChange}
                label={name}
              >
                {options.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}
  
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={predictPrice}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Tahmin Et"}
          </Button>
  
          {result && (
            <Typography variant="h5" fontWeight={600} color="primary" align="center">
               {result} 
            </Typography>
          )}
        </Stack>
      </StyledPaper>
  </BackgroundWrapper>
  );
  
}
export default App;  