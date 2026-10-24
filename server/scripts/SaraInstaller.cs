using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Diagnostics;
using System.Windows.Forms;

namespace SaraMedical
{
    public class InstallerForm : Form
    {
        private const string SARA_EXE_BASE64 = "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bGVyU2VydmljZXMAQ29tcGlsYXRpb25SZWxheGF0aW9uc0F0dHJpYnV0ZQAuY3RvcgBSdW50aW1lQ29tcGF0aWJpbGl0eUF0dHJpYnV0ZQBTQVJBAFNUQVRocmVhZEF0dHJpYnV0ZQBBcHBEb21haW4AZ2V0X0N1cnJlbnREb21haW4AZ2V0X0Jhc2VEaXJlY3RvcnkAU3lzdGVtLklPAFBhdGgAQ29tYmluZQBGaWxlAEV4aXN0cwBSZWFkQWxsTGluZXMAU3RyaW5nAFRyaW0AU3RyaW5nQ29tcGFyaXNvbgBTdGFydHNXaXRoAFN1YnN0cmluZwBJc051bGxPckVtcHR5AEVudmlyb25tZW50AEV4cGFuZEVudmlyb25tZW50VmFyaWFibGVzAFN5c3RlbS5EaWFnbm9zdGljcwBQcm9jZXNzU3RhcnRJbmZvAHNldF9GaWxlTmFtZQBGb3JtYXQAc2V0X0FyZ3VtZW50cwBzZXRfVXNlU2hlbGxFeGVjdXRlAFByb2Nlc3MAU3RhcnQARXhjZXB0aW9uAGdldF9NZXNzYWdlAENvbmNhdABTeXN0ZW0uV2luZG93cy5Gb3JtcwBNZXNzYWdlQm94AERpYWxvZ1Jlc3VsdABNZXNzYWdlQm94QnV0dG9ucwBNZXNzYWdlQm94SWNvbgBTaG93AAAAAAA3aAB0AHQAcAA6AC8ALwBsAG8AYwBhAGwAaABvAHMAdAA6ADUAMQA3ADMALwBsAG8AZwBpAG4AABVjAG8AbgBmAGkAZwAuAGkAbgBpAAAJVQBSAEwAPQAAcyUAUAByAG8AZwByAGEAbQBGAGkAbABlAHMAKAB4ADgANgApACUAXABNAGkAYwByAG8AcwBvAGYAdABcAEUAZABnAGUAXABBAHAAcABsAGkAYwBhAHQAaQBvAG4AXABtAHMAZQBkAGcAZQAuAGUAeABlAABpJQBQAHIAbwBnAHIAYQBtAEYAaQBsAGUAcwAlAFwATQBpAGMAcgBvAHMAbwBmAHQAXABFAGQAZwBlAFwAQQBwAHAAbABpAGMAYQB0AGkAbwBuAFwAbQBzAGUAZABnAGUALgBlAHgAZQAAaSUATABvAGMAYQBsAEEAcABwAEQAYQB0AGEAJQBcAE0AaQBjAHIAbwBzAG8AZgB0AFwARQBkAGcAZQBcAEEAcABwAGwA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";

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
        private string targetAppUrl = "http://localhost:5173/login";

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
            string defaultDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "SARA Medical Suite");
            txtInstallDir = new TextBox();
            txtInstallDir.Text = defaultDir;
            txtInstallDir.Location = new Point(leftMargin, currentY);
            txtInstallDir.Size = new Size(485, 25);
            txtInstallDir.BackColor = Color.FromArgb(30, 41, 59);
            txtInstallDir.ForeColor = Color.White;
            txtInstallDir.BorderStyle = BorderStyle.FixedSingle;
            this.Controls.Add(txtInstallDir);

            currentY += 35;

            // URL del Servidor / Clínica
            lblServerUrl = new Label();
            lblServerUrl.Text = "URL de la Clínica / Servidor:";
            lblServerUrl.Location = new Point(leftMargin, currentY);
            lblServerUrl.AutoSize = true;
            lblServerUrl.ForeColor = Color.FromArgb(148, 163, 184);
            this.Controls.Add(lblServerUrl);

            currentY += 22;
            txtServerUrl = new TextBox();
            txtServerUrl.Text = "http://localhost:5173/login";
            txtServerUrl.Location = new Point(leftMargin, currentY);
            txtServerUrl.Size = new Size(485, 25);
            txtServerUrl.BackColor = Color.FromArgb(30, 41, 59);
            txtServerUrl.ForeColor = Color.White;
            txtServerUrl.BorderStyle = BorderStyle.FixedSingle;
            this.Controls.Add(txtServerUrl);

            currentY += 38;

            // Checkboxes
            chkDesktopShortcut = new CheckBox();
            chkDesktopShortcut.Text = "Crear acceso directo en el Escritorio";
            chkDesktopShortcut.Checked = true;
            chkDesktopShortcut.Location = new Point(leftMargin, currentY);
            chkDesktopShortcut.AutoSize = true;
            chkDesktopShortcut.ForeColor = Color.White;
            this.Controls.Add(chkDesktopShortcut);

            currentY += 26;
            chkStartMenuShortcut = new CheckBox();
            chkStartMenuShortcut.Text = "Crear acceso directo en el Menú Inicio";
            chkStartMenuShortcut.Checked = true;
            chkStartMenuShortcut.Location = new Point(leftMargin, currentY);
            chkStartMenuShortcut.AutoSize = true;
            chkStartMenuShortcut.ForeColor = Color.White;
            this.Controls.Add(chkStartMenuShortcut);

            currentY += 26;
            chkLaunchAfter = new CheckBox();
            chkLaunchAfter.Text = "Iniciar SARA inmediatamente al finalizar la instalación";
            chkLaunchAfter.Checked = true;
            chkLaunchAfter.Location = new Point(leftMargin, currentY);
            chkLaunchAfter.AutoSize = true;
            chkLaunchAfter.ForeColor = Color.FromArgb(52, 211, 153); // #34d399
            this.Controls.Add(chkLaunchAfter);

            currentY += 35;

            // Barra de progreso y estado
            progressBar = new ProgressBar();
            progressBar.Location = new Point(leftMargin, currentY);
            progressBar.Size = new Size(485, 14);
            progressBar.Value = 0;
            this.Controls.Add(progressBar);

            currentY += 18;
            lblStatus = new Label();
            lblStatus.Text = "Listo para iniciar la instalación.";
            lblStatus.Location = new Point(leftMargin, currentY);
            lblStatus.Size = new Size(485, 20);
            lblStatus.ForeColor = Color.FromArgb(148, 163, 184);
            this.Controls.Add(lblStatus);

            // Botones inferiores
            int btnY = this.ClientSize.Height - 55;
            
            btnInstall = new Button();
            btnInstall.Text = "Instalar SARA";
            btnInstall.Location = new Point(leftMargin + 250, btnY);
            btnInstall.Size = new Size(130, 36);
            btnInstall.BackColor = Color.FromArgb(16, 185, 129); // #10b981
            btnInstall.ForeColor = Color.White;
            btnInstall.FlatStyle = FlatStyle.Flat;
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            btnInstall.Cursor = Cursors.Hand;
            btnInstall.Click += BtnInstall_Click;
            this.Controls.Add(btnInstall);

            btnCancel = new Button();
            btnCancel.Text = "Salir";
            btnCancel.Location = new Point(leftMargin + 390, btnY);
            btnCancel.Size = new Size(95, 36);
            btnCancel.BackColor = Color.FromArgb(30, 41, 59);
            btnCancel.ForeColor = Color.FromArgb(203, 213, 225);
            btnCancel.FlatStyle = FlatStyle.Flat;
            btnCancel.FlatAppearance.BorderSize = 1;
            btnCancel.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            btnCancel.Cursor = Cursors.Hand;
            btnCancel.Click += (s, e) => this.Close();
            this.Controls.Add(btnCancel);
        }

        private void PnlHeader_Paint(object sender, PaintEventArgs e)
        {
            using (Pen borderPen = new Pen(Color.FromArgb(30, 41, 59), 1))
            {
                e.Graphics.DrawLine(borderPen, 0, pnlHeader.Height - 1, pnlHeader.Width, pnlHeader.Height - 1);
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

            PerformInstallation();
        }

        private void PerformInstallation()
        {
            btnInstall.Enabled = false;
            txtInstallDir.Enabled = false;
            txtServerUrl.Enabled = false;
            chkDesktopShortcut.Enabled = false;
            chkStartMenuShortcut.Enabled = false;
            chkLaunchAfter.Enabled = false;

            finalInstallPath = txtInstallDir.Text.Trim();
            targetAppUrl = txtServerUrl.Text.Trim();
            if (string.IsNullOrEmpty(targetAppUrl)) targetAppUrl = "http://localhost:5173/login";

            Timer timer = new Timer();
            timer.Interval = 250;
            int step = 0;

            timer.Tick += (s, ev) =>
            {
                step++;
                switch (step)
                {
                    case 1:
                        lblStatus.Text = "Paso 1/5: Creando directorio de instalación...";
                        progressBar.Value = 20;
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
                        lblStatus.Text = "Paso 2/5: Generando lanzadores nativos y configuración...";
                        progressBar.Value = 45;
                        try
                        {
                            CreateLaunchers(finalInstallPath, targetAppUrl);
                        }
                        catch (Exception ex)
                        {
                            timer.Stop();
                            MessageBox.Show("Error al generar lanzadores: " + ex.Message, "Error SARA", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            btnInstall.Enabled = true;
                            return;
                        }
                        break;

                    case 3:
                        lblStatus.Text = "Paso 3/5: Creando accesos directos en Windows...";
                        progressBar.Value = 70;
                        try
                        {
                            string exeFile = Path.Combine(finalInstallPath, "SARA.exe");
                            string launcherVbs = Path.Combine(finalInstallPath, "SARA.vbs");
                            string launcherBat = Path.Combine(finalInstallPath, "SARA_Desktop.bat");
                            string targetPath = File.Exists(exeFile) ? exeFile : (File.Exists(launcherVbs) ? launcherVbs : launcherBat);

                            if (chkDesktopShortcut.Checked)
                            {
                                string desktop = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                                string deskShortcut = Path.Combine(desktop, "SARA Medical Suite.lnk");
                                CreateShortcut(deskShortcut, targetPath, "", finalInstallPath, "SARA Medical Suite - Sistema Asistencial");
                            }

                            if (chkStartMenuShortcut.Checked)
                            {
                                string programs = Environment.GetFolderPath(Environment.SpecialFolder.Programs);
                                string startShortcut = Path.Combine(programs, "SARA Medical Suite.lnk");
                                CreateShortcut(startShortcut, targetPath, "", finalInstallPath, "SARA Medical Suite - Sistema Asistencial");
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Aviso acceso directo: " + ex.Message);
                        }
                        break;

                    case 4:
                        lblStatus.Text = "Paso 4/5: Configurando aceleración de pantalla completa...";
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
            // 1. Binario ejecutable nativo SARA.exe
            string exeFile = Path.Combine(installDir, "SARA.exe");
            try
            {
                byte[] exeBytes = Convert.FromBase64String(SARA_EXE_BASE64);
                File.WriteAllBytes(exeFile, exeBytes);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Aviso extrayendo SARA.exe: " + ex.Message);
            }

            // 2. Archivo de configuración config.ini
            string configFile = Path.Combine(installDir, "config.ini");
            File.WriteAllText(configFile, "[SARA]\r\nURL=" + url + "\r\n");

            // 3. Script BAT para arranque directo con Microsoft Edge o Chrome en modo aplicación limpia
            string batFile = Path.Combine(installDir, "SARA_Desktop.bat");
            string batContent = 
                "@echo off\r\n" +
                "title SARA Medical Suite Launcher\r\n" +
                "set SARA_URL=" + url + "\r\n" +
                "if exist \"%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe\" (\r\n" +
                "    start \"\" \"%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe\" --app=%SARA_URL% --window-size=1366,850\r\n" +
                "    exit /b\r\n" +
                ")\r\n" +
                "if exist \"%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe\" (\r\n" +
                "    start \"\" \"%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe\" --app=%SARA_URL% --window-size=1366,850\r\n" +
                "    exit /b\r\n" +
                ")\r\n" +
                "if exist \"%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe\" (\r\n" +
                "    start \"\" \"%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe\" --app=%SARA_URL% --window-size=1366,850\r\n" +
                "    exit /b\r\n" +
                ")\r\n" +
                "start \"\" \"%SARA_URL%\"\r\n";

            File.WriteAllText(batFile, batContent);

            // 4. Script VBS para ejecutar el BAT sin ventana de consola
            string vbsFile = Path.Combine(installDir, "SARA.vbs");
            string vbsContent = 
                "Set WshShell = CreateObject(\"WScript.Shell\")\r\n" +
                "WshShell.Run chr(34) & \"" + batFile + "\" & Chr(34), 0\r\n" +
                "Set WshShell = Nothing\r\n";

            File.WriteAllText(vbsFile, vbsContent);

            // 5. Archivo Léame / Información
            string readmeFile = Path.Combine(installDir, "LEAME.txt");
            string readmeContent = 
                "SARA Medical Suite v2.4.0\r\n" +
                "Sistema Administrativo y de Registro Automatizado de Pacientes\r\n\r\n" +
                "URL Configurada: " + url + "\r\n" +
                "Para iniciar el sistema manualmente, haga doble clic en SARA.exe\r\n" +
                "Para cambiar la dirección del servidor, edite el archivo config.ini o SARA_Desktop.bat\r\n" +
                "Soporte y Licencias: Super Master SARA\r\n";

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
            else
            {
                string edgeIconPath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
                if (!File.Exists(edgeIconPath))
                {
                    edgeIconPath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
                }
                if (File.Exists(edgeIconPath))
                {
                    shortcutType.InvokeMember("IconLocation", BindingFlags.SetProperty, null, shortcut, new object[] { edgeIconPath + ",0" });
                }
            }

            shortcutType.InvokeMember("Save", BindingFlags.InvokeMethod, null, shortcut, null);
        }

        private void LaunchSaraDesktop()
        {
            try
            {
                string exeFile = Path.Combine(finalInstallPath, "SARA.exe");
                string vbsFile = Path.Combine(finalInstallPath, "SARA.vbs");
                string batFile = Path.Combine(finalInstallPath, "SARA_Desktop.bat");

                if (File.Exists(exeFile))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = exeFile,
                        WorkingDirectory = finalInstallPath,
                        UseShellExecute = true
                    });
                }
                else if (File.Exists(vbsFile))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = "wscript.exe",
                        Arguments = "\"" + vbsFile + "\"",
                        UseShellExecute = true
                    });
                }
                else if (File.Exists(batFile))
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = batFile,
                        WorkingDirectory = finalInstallPath,
                        UseShellExecute = true
                    });
                }
                else
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = targetAppUrl,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error al iniciar SARA: " + ex.Message, "Aviso", MessageBoxButtons.OK, MessageBoxIcon.Warning);
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
