import { useEffect, useState } from "react";
import { fetchPaises, fetchTiposDocumento, registerUser } from "../api.js";
import "./register.css";

export default function Register({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    tipoDocumento: "",
    numeroDocumento: "",
    codPaisDocumento: "",
    calle: "",
    localidad: "",
    codigoPostal: "",
    codPaisDireccion: "",
  });
  const [paises, setPaises] = useState([]);
  const [tiposDocumento, setTiposDocumento] = useState([]);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchPaises()
      .then(setPaises)
      .catch(() => setFormError("No se pudieron cargar los países."));
    fetchTiposDocumento()
      .then(setTiposDocumento)
      .catch(() => setFormError("No se pudieron cargar los tipos de documento."));
  }, []);

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const { nombre, email, password, confirmPassword, tipoDocumento, numeroDocumento, codPaisDocumento, calle, localidad, codigoPostal, codPaisDireccion } = formData;

    if (!nombre.trim() || !email.trim() || !password || !confirmPassword || !tipoDocumento || !numeroDocumento.trim() || !codPaisDocumento || !calle.trim() || !localidad.trim() || !codigoPostal.trim() || !codPaisDireccion) {
      setFormError("Completá todos los datos para crear la cuenta.");
      return;
    }

    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        email: email.trim().toLowerCase(),
        nombre: nombre.trim(),
        password,
        tipoDocumento: Number(tipoDocumento),
        numeroDocumento: numeroDocumento.trim(),
        codPaisDocumento,
        codPaisDireccion,
        calle: calle.trim(),
        localidad: localidad.trim(),
        codigoPostal: codigoPostal.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-card auth-card">
          <div className="register-accentBar" />
          <div className="register-header">
            <div className="register-logoIcon">🎟️</div>
            <h1 className="register-title">¡Usuario creado!</h1>
            <p className="register-subtitle">Tu cuenta fue registrada exitosamente. Ya podés iniciar sesión.</p>
          </div>
          <button className="register-btn register-btn-primary" onClick={onBackToLogin} style={{ marginTop: "1rem" }}>
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-card auth-card">
        <div className="register-accentBar" />
        <div className="register-header">
          <div className="register-logoIcon">🎟️</div>
          <h1 className="register-title">Crear usuario</h1>
        </div>

        <form className="register-form" onSubmit={handleSubmit}>
          <fieldset className="register-fieldset">
            <legend className="register-legend">Datos personales</legend>

            <div className="register-field">
              <label className="register-label">Nombre completo</label>
              <input className="register-input" type="text" placeholder="Tu nombre" value={formData.nombre} onChange={set("nombre")} required />
            </div>

            <div className="register-field">
              <label className="register-label">Correo electrónico</label>
              <input className="register-input" type="email" placeholder="usuario@email.com" value={formData.email} onChange={set("email")} required />
            </div>

            <div className="register-row">
              <div className="register-field">
                <label className="register-label">Contraseña</label>
                <input className="register-input" type="password" placeholder="••••••••" value={formData.password} onChange={set("password")} required />
              </div>
              <div className="register-field">
                <label className="register-label">Confirmar contraseña</label>
                <input className="register-input" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={set("confirmPassword")} required />
              </div>
            </div>
          </fieldset>

          <fieldset className="register-fieldset">
            <legend className="register-legend">Documento</legend>

            <div className="register-row">
              <div className="register-field register-field--half">
                <label className="register-label">Tipo de documento</label>
                <select className="register-input register-select" value={formData.tipoDocumento} onChange={set("tipoDocumento")} required>
                  <option value="">Seleccioná...</option>
                  {tiposDocumento.map((t) => (
                    <option key={t.idTipo} value={t.idTipo}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="register-field register-field--half">
                <label className="register-label">Número de documento</label>
                <input className="register-input" type="text" placeholder="12345678" value={formData.numeroDocumento} onChange={set("numeroDocumento")} required />
              </div>
            </div>

            <div className="register-field">
              <label className="register-label">País del documento</label>
              <select className="register-input register-select" value={formData.codPaisDocumento} onChange={set("codPaisDocumento")} required>
                <option value="">Seleccioná...</option>
                {paises.map((p) => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </fieldset>

          <fieldset className="register-fieldset">
            <legend className="register-legend">Dirección</legend>

            <div className="register-field">
              <label className="register-label">Calle</label>
              <input className="register-input" type="text" placeholder="Av. Siempre Viva 123" value={formData.calle} onChange={set("calle")} required />
            </div>

            <div className="register-row">
              <div className="register-field register-field--half">
                <label className="register-label">Localidad</label>
                <input className="register-input" type="text" placeholder="Montevideo" value={formData.localidad} onChange={set("localidad")} required />
              </div>
              <div className="register-field register-field--half">
                <label className="register-label">Código postal</label>
                <input className="register-input" type="text" placeholder="11000" value={formData.codigoPostal} onChange={set("codigoPostal")} required />
              </div>
            </div>

            <div className="register-field">
              <label className="register-label">País de la dirección</label>
              <select className="register-input register-select" value={formData.codPaisDireccion} onChange={set("codPaisDireccion")} required>
                <option value="">Seleccioná...</option>
                {paises.map((p) => (
                  <option key={p.codigo} value={p.codigo}>{p.nombre}</option>
                ))}
              </select>
            </div>
          </fieldset>

          {formError && <p className="register-error">{formError}</p>}

          <button className="register-btn register-btn-primary" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <div className="register-footer">
          <p>¿Ya tenés usuario?</p>
          <button type="button" className="register-link-button" onClick={onBackToLogin}>
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    </div>
  );
}
