using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Windows.Forms;

namespace SaraMedical
{
    public class InstallerForm : Form
    {
        private Label lblHeaderTitle;
        private Label lblHeaderSubtitle;
        private Panel pnlHeader;
        
        private Label lblDescription;
        private Label lblInstallDir;
        private TextBox txtInstallDir;
        private Label lblServerUrl;
        private TextBox txtServerUrl;
        
        private CheckBox chkDesktopShortcut;
        private CheckBox chkStartMenuShortcut;
        private CheckBox chkLaunchAfter;
        
        private ProgressBar progressBar;
        private Label lblStatus;
        
        private Button btnInstall;
        private Button btnCancel;
        
        private bool isInstalled = false;
        private string finalInstallPath = "";
        private string targetAppUrl = "https://asistentesara.com/login";

        public InstallerForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "SARA Medical Suite v2.4.0 - Asistente de Instalación";
            this.Size = new Size(560, 520);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(15, 23, 42); // #0f172a
            this.ForeColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular);

            // Panel Superior / Header
            pnlHeader = new Panel();
            pnlHeader.Dock = DockStyle.Top;
            pnlHeader.Height = 85;
            pnlHeader.BackColor = Color.FromArgb(9, 14, 23); // #090e17
            pnlHeader.Paint += PnlHeader_Paint;

            lblHeaderTitle = new Label();
            lblHeaderTitle.Text = "SARA Medical Suite v2.4.0";
            lblHeaderTitle.Font = new Font("Segoe UI", 14F, FontStyle.Bold);
            lblHeaderTitle.ForeColor = Color.FromArgb(56, 189, 248); // #38bdf8
            lblHeaderTitle.Location = new Point(24, 18);
            lblHeaderTitle.AutoSize = true;

            lblHeaderSubtitle = new Label();
            lblHeaderSubtitle.Text = "Sistema Administrativo y de Registro Automatizado de Pacientes";
            lblHeaderSubtitle.Font = new Font("Segoe UI", 8.5F, FontStyle.Regular);
            lblHeaderSubtitle.ForeColor = Color.FromArgb(148, 163, 184); // #94a3b8
            lblHeaderSubtitle.Location = new Point(25, 48);
            lblHeaderSubtitle.AutoSize = true;

            pnlHeader.Controls.Add(lblHeaderTitle);
            pnlHeader.Controls.Add(lblHeaderSubtitle);
            this.Controls.Add(pnlHeader);

            // Contenedor Central
            int leftMargin = 30;
            int currentY = 105;

            lblDescription = new Label();
            lblDescription.Text = "Este asistente instalará SARA Desktop en su equipo y creará los accesos directos necesarios para iniciar el sistema en modo aplicación nativa de alta velocidad.";
            lblDescription.Location = new Point(leftMargin, currentY);
            lblDescription.Size = new Size(485, 42);
            lblDescription.ForeColor = Color.FromArgb(203, 213, 225);
            this.Controls.Add(lblDescription);

            currentY += 50;

            // Carpeta de Instalación
            lblInstallDir = new Label();
            lblInstallDir.Text = "Carpeta de instalación:";
            lblInstallDir.Location = new Point(leftMargin, currentY);
            lblInstallDir.AutoSize = true;
            lblInstallDir.ForeColor = Color.FromArgb(148, 163, 184);
            this.Controls.Add(lblInstallDir);

            currentY += 22;

            txtInstallDir = new TextBox();
            string defaultFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "SARA");
            txtInstallDir.Text = defaultFolder;
            txtInstallDir.Location = new Point(leftMargin, currentY);
            txtInstallDir.Size = new Size(485, 26);
            txtInstallDir.BackColor = Color.FromArgb(30, 41, 59);
            txtInstallDir.ForeColor = Color.FromArgb(248, 250, 252);
            txtInstallDir.BorderStyle = BorderStyle.FixedSingle;
            this.Controls.Add(txtInstallDir);

            currentY += 38;

            // URL del Servidor SARA
            lblServerUrl = new Label();
            lblServerUrl.Text = "Servidor Web Oficial:";
            lblServerUrl.Location = new Point(leftMargin, currentY);
            lblServerUrl.AutoSize = true;
            lblServerUrl.ForeColor = Color.FromArgb(148, 163, 184);
            this.Controls.Add(lblServerUrl);

            currentY += 22;

            txtServerUrl = new TextBox();
            txtServerUrl.Text = targetAppUrl;
            txtServerUrl.Location = new Point(leftMargin, currentY);
            txtServerUrl.Size = new Size(485, 26);
            txtServerUrl.BackColor = Color.FromArgb(30, 41, 59);
            txtServerUrl.ForeColor = Color.FromArgb(56, 189, 248);
            txtServerUrl.BorderStyle = BorderStyle.FixedSingle;
            this.Controls.Add(txtServerUrl);

            currentY += 40;

            // Checkboxes de Accesos Directos
            chkDesktopShortcut = new CheckBox();
            chkDesktopShortcut.Text = "Crear acceso directo en el Escritorio";
            chkDesktopShortcut.Location = new Point(leftMargin, currentY);
            chkDesktopShortcut.AutoSize = true;
            chkDesktopShortcut.Checked = true;
            chkDesktopShortcut.ForeColor = Color.FromArgb(226, 232, 240);
            this.Controls.Add(chkDesktopShortcut);

            currentY += 26;

            chkStartMenuShortcut = new CheckBox();
            chkStartMenuShortcut.Text = "Agregar al Menú Inicio de Windows";
            chkStartMenuShortcut.Location = new Point(leftMargin, currentY);
            chkStartMenuShortcut.AutoSize = true;
            chkStartMenuShortcut.Checked = true;
            chkStartMenuShortcut.ForeColor = Color.FromArgb(226, 232, 240);
            this.Controls.Add(chkStartMenuShortcut);

            currentY += 26;

            chkLaunchAfter = new CheckBox();
            chkLaunchAfter.Text = "Iniciar SARA inmediatamente al finalizar la instalación";
            chkLaunchAfter.Location = new Point(leftMargin, currentY);
            chkLaunchAfter.AutoSize = true;
            chkLaunchAfter.Checked = true;
            chkLaunchAfter.ForeColor = Color.FromArgb(226, 232, 240);
            this.Controls.Add(chkLaunchAfter);

            currentY += 34;

            // Barra de Progreso y Estado
            progressBar = new ProgressBar();
            progressBar.Location = new Point(leftMargin, currentY);
            progressBar.Size = new Size(485, 14);
            progressBar.Value = 0;
            progressBar.Visible = false;
            this.Controls.Add(progressBar);

            currentY += 18;

            lblStatus = new Label();
            lblStatus.Text = "Listo para iniciar la instalación.";
            lblStatus.Location = new Point(leftMargin, currentY);
            lblStatus.Size = new Size(485, 20);
            lblStatus.ForeColor = Color.FromArgb(148, 163, 184);
            lblStatus.Font = new Font("Segoe UI", 8F);
            this.Controls.Add(lblStatus);

            // Botones Inferiores
            btnCancel = new Button();
            btnCancel.Text = "Cancelar";
            btnCancel.Location = new Point(325, 430);
            btnCancel.Size = new Size(95, 34);
            btnCancel.BackColor = Color.FromArgb(30, 41, 59);
            btnCancel.ForeColor = Color.FromArgb(203, 213, 225);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(btnCancel);

            btnInstall = new Button();
            btnInstall.Text = "Instalar SARA";
            btnInstall.Location = new Point(430, 430);
            btnInstall.Size = new Size(115, 34);
            btnInstall.BackColor = Color.FromArgb(14, 165, 233); // #0ea5e9
            btnInstall.ForeColor = Color.White;
            btnInstall.FlatStyle = FlatStyle.Flat;
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Font = new Font("Segoe UI", 9F, FontStyle.Bold);
            btnInstall.Cursor = Cursors.Hand;
            btnInstall.Click += BtnInstall_Click;
            this.Controls.Add(btnInstall);
        }

        private void PnlHeader_Paint(object sender, PaintEventArgs e)
        {
            using (Pen pen = new Pen(Color.FromArgb(30, 41, 59), 1))
            {
                e.Graphics.DrawLine(pen, 0, pnlHeader.Height - 1, pnlHeader.Width, pnlHeader.Height - 1);
            }
        }

        private void BtnInstall_Click(object sender, EventArgs e)
        {
            if (isInstalled)
            {
                LaunchSaraDesktop();
                this.Close();
                return;
            }

            finalInstallPath = txtInstallDir.Text.Trim();
            if (string.IsNullOrEmpty(finalInstallPath))
            {
                MessageBox.Show("Por favor indique una ruta de instalación válida.", "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            targetAppUrl = txtServerUrl.Text.Trim();
            if (string.IsNullOrEmpty(targetAppUrl))
            {
                targetAppUrl = "https://asistentesara.com/login";
            }

            btnInstall.Enabled = false;
            btnCancel.Enabled = false;
            progressBar.Visible = true;
            progressBar.Value = 10;
            lblStatus.Text = "Iniciando instalación...";

            Timer timer = new Timer();
            timer.Interval = 120;
            int step = 0;

            timer.Tick += (s, ev) =>
            {
                step++;
                switch (step)
                {
                    case 1:
                        lblStatus.Text = "Creando directorio de instalación...";
                        progressBar.Value = 25;
                        try
                        {
                            if (!Directory.Exists(finalInstallPath))
                            {
                                Directory.CreateDirectory(finalInstallPath);
                            }
                        }
                        catch (Exception ex)
                        {
                            timer.Stop();
                            MessageBox.Show("Error al crear carpeta: " + ex.Message, "Error SARA", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            btnInstall.Enabled = true;
                            return;
                        }
                        break;

                    case 2:
                        lblStatus.Text = "Instalando aplicación SARA Desktop...";
                        progressBar.Value = 50;
                        try
                        {
                            CreateLaunchers(finalInstallPath, targetAppUrl);
                        }
                        catch (Exception ex)
                        {
                            timer.Stop();
                            MessageBox.Show("Error al instalar aplicación: " + ex.Message, "Error SARA", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            btnInstall.Enabled = true;
                            return;
                        }
                        break;

                    case 3:
                        lblStatus.Text = "Creando accesos directos en Windows...";
                        progressBar.Value = 75;
                        try
                        {
                            string exeFile = Path.Combine(finalInstallPath, "SARA.exe");
                            if (chkDesktopShortcut.Checked)
                            {
                                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                                string deskShortcut = Path.Combine(desktop, "SARA Medical Suite.lnk");
                                CreateShortcut(deskShortcut, exeFile, "", finalInstallPath, "SARA Medical Suite - Sistema Asistencial");
                            }

                            if (chkStartMenuShortcut.Checked)
                            {
                                string programs = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                                string startShortcut = Path.Combine(programs, "SARA Medical Suite.lnk");
                                CreateShortcut(startShortcut, exeFile, "", finalInstallPath, "SARA Medical Suite - Sistema Asistencial");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Aviso acceso directo: " + ex.Message);
                        }
                        break;

                    case 4:
                        lblStatus.Text = "Configurando entorno de alta velocidad...";
                        progressBar.Value = 90;
                        break;

                    case 5:
                        timer.Stop();
                        progressBar.Value = 100;
                        lblStatus.Text = "¡Instalación completada exitosamente!";
                        lblStatus.ForeColor = Color.FromArgb(52, 211, 153);
                        
                        isInstalled = true;
                        btnInstall.Text = "Abrir SARA Ahora";
                        btnInstall.BackColor = Color.FromArgb(5, 150, 105);
                        btnInstall.Enabled = true;
                        btnCancel.Text = "Cerrar";
                        btnCancel.Enabled = true;

                        if (chkLaunchAfter.Checked)
                        {
                            LaunchSaraDesktop();
                        }
                        break;
                }
            };

            timer.Start();
        }

        private void CreateLaunchers(string installDir, string url)
        {
            string exeFile = Path.Combine(installDir, "SARA.exe");

            try
            {
                using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("SARA.exe"))
                {
                    if (stream != null)
                    {
                        using (FileStream fileStream = new FileStream(exeFile, FileMode.Create, FileAccess.Write))
                        {
                            byte[] buffer = new byte[8192];
                            int bytesRead;
                            while ((bytesRead = stream.Read(buffer, 0, buffer.Length)) > 0)
                            {
                                fileStream.Write(buffer, 0, bytesRead);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Aviso recurso: " + ex.Message);
            }

            string configFile = Path.Combine(installDir, "config.ini");
            File.WriteAllText(configFile, "[SARA]\r\nURL=" + url + "\r\n");

            string readmeFile = Path.Combine(installDir, "LEAME.txt");
            string readmeContent = 
                "SARA Medical Suite v2.4.0\r\n" +
                "Sistema Administrativo y de Registro Automatizado de Pacientes\r\n\r\n" +
                "URL: " + url + "\r\n" +
                "Para iniciar el sistema haga doble clic en SARA.exe\r\n" +
                "Soporte: Super Master SARA\r\n";

            File.WriteAllText(readmeFile, readmeContent);
        }

        private void CreateShortcut(string shortcutPath, string targetPath, string arguments, string workingDir, string description)
        {
            Type shellType = Type.GetTypeFromProgID("WScript.Shell");
            if (shellType == null) return;

            object shell = Activator.CreateInstance(shellType);
            object shortcut = shellType.InvokeMember("CreateShortcut", BindingFlags.InvokeMethod, null, shell, new object[] { shortcutPath });
            Type shortcutType = shortcut.GetType();

            shortcutType.InvokeMember("TargetPath", BindingFlags.SetProperty, null, shortcut, new object[] { targetPath });
            if (!string.IsNullOrEmpty(arguments))
            {
                shortcutType.InvokeMember("Arguments", BindingFlags.SetProperty, null, shortcut, new object[] { arguments });
            }
            shortcutType.InvokeMember("WorkingDirectory", BindingFlags.SetProperty, null, shortcut, new object[] { workingDir });
            shortcutType.InvokeMember("Description", BindingFlags.SetProperty, null, shortcut, new object[] { description });

            if (File.Exists(targetPath) && targetPath.EndsWith(".exe", StringComparison.OrdinalIgnoreCase))
            {
                shortcutType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { targetPath + ",0" });
            }

            shortcutType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
        }

        private void LaunchSaraDesktop()
        {
            try
            {
                string exeFile = Path.Combine(finalInstallPath, "SARA.exe");
                if (File.Exists(exeFile))
                {
                    Process.Start(new ProcessStartInfo { FileName = exeFile, UseShellExecute = true });
                    return;
                }

                Process.Start(new ProcessStartInfo { FileName = targetAppUrl, UseShellExecute = true });
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error iniciando SARA: " + ex.Message, "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        [STAThread]
        public static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new InstallerForm());
        }
    }
}
