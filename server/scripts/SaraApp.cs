using System;
using System.IO;
using System.Diagnostics;
using System.Windows.Forms;

namespace SaraMedical
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            string url = "http://localhost:5173/login";
            try
            {
                string configPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "config.ini");
                if (File.Exists(configPath))
                {
                    string[] lines = File.ReadAllLines(configPath);
                    foreach (string line in lines)
                    {
                        string trimmed = line.Trim();
                        if (trimmed.StartsWith("URL=", StringComparison.OrdinalIgnoreCase))
                        {
                            string customUrl = trimmed.Substring(4).Trim();
                            if (!string.IsNullOrEmpty(customUrl))
                            {
                                url = customUrl;
                            }
                        }
                    }
                }
            }
            catch {}

            // Si se pasa un argumento por línea de comandos, usarlo como URL
            if (args != null && args.Length > 0 && !string.IsNullOrEmpty(args[0]))
            {
                url = args[0];
            }

            // Buscar navegadores para modo App nativa
            string[] possibleBrowsers = new string[]
            {
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
                Environment.ExpandEnvironmentVariables(@"%LocalAppData%\Microsoft\Edge\Application\msedge.exe"),
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
                Environment.ExpandEnvironmentVariables(@"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"),
                Environment.ExpandEnvironmentVariables(@"%LocalAppData%\Google\Chrome\Application\chrome.exe")
            };

            string browserPath = null;
            foreach (string p in possibleBrowsers)
            {
                if (File.Exists(p))
                {
                    browserPath = p;
                    break;
                }
            }

            try
            {
                if (!string.IsNullOrEmpty(browserPath))
                {
                    ProcessStartInfo psi = new ProcessStartInfo();
                    psi.FileName = browserPath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1366,850", url);
                    psi.UseShellExecute = true;
                    Process.Start(psi);
                }
                else
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = url,
                        UseShellExecute = true
                    });
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("No se pudo iniciar SARA Medical Suite: " + ex.Message, "SARA Desktop", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
