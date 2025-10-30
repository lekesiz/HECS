# HECS (Haguenau Edge Control System) Projesi: Teknik Yapılabilirlik Dokümanı

**Yazar:** Manus AI
**Tarih:** 30 Ekim 2025
**Versiyon:** 1.0

## 1. Giriş

Bu doküman, **Haguenau Edge Control System (HECS)** projesinin teknik olarak gerçekleştirilebilirliğini analiz etmektedir. Proje, müşteri lokasyonlarına yerleştirilecek Raspberry Pi tabanlı uç bilişim cihazları aracılığıyla **Haguenau.pro platformunun** yeteneklerini genişletmeyi ve yerel işleme sağlamayı hedeflemektedir. HECS, Haguenau.pro'nun ana uzantısı olarak tasarlanmıştır. Bu doküman, önerilen sistem mimarisini, teknoloji seçimlerini, temel bileşenleri, güvenlik altyapısını ve operasyonel süreçleri detaylandırarak projenin teknik açıdan sağlamlığını ve uygulanabilirliğini ortaya koymaktadır. Analiz, üç aşamalı şirket içi toplantı raporlarına dayanmaktadır [1, 2, 3].

## 2. Sistem Mimarisi

HECS, üç ana katmandan oluşan modüler ve dağıtık bir mimariye sahiptir. Bu katmanlar, güvenli ve ölçeklenebilir bir operasyon sağlamak üzere tasarlanmıştır.

1.  **Haguenau Cloud Control Center:** Projenin merkezi yönetim ve kontrol beynidir. Çok kiracılı (multi-tenant) bir yapıda tasarlanan bu bulut tabanlı panel, cihaz envanterini, görev planlamasını, yazılım dağıtım kanallarını (stable, beta) ve rol tabanlı erişim kontrolünü (RBAC) yönetir.

2.  **Raspberry Pi Edge Node (HECS Agent):** Müşteri ağına yerleştirilen fiziksel cihazdır. Bu ajan, merkezi kontrol düzlemi ile MQTT veya güvenli SSH tünelleri üzerinden iletişim kurar. Ajan, konteynerize edilmiş servisleri çalıştırarak ağ izleme, görev otomasyonu, otomatik güncelleme ve yerel yapay zeka gibi işlevleri yerine getirir.

3.  **Customer Network Layer:** HECS ajanının üzerinde çalıştığı müşteri ağıdır. Ajan, bu katmanda yerel şirket verilerine (sadece yerel depolama ile), Haguenau Pro profil yönetimine ve yerel yapay zeka bilgi tabanına erişim sağlar.

Bu katmanlı yapı, görevlerin ve verilerin net bir şekilde ayrılmasını sağlayarak hem güvenliği hem de yönetilebilirliği artırır.

## 3. Donanım ve İşletim Sistemi

### 3.1. Donanım Seçimi

Proje için **Raspberry Pi 4 Model B** veya daha yüksek performanslı **Raspberry Pi 5** donanımı seçilmiştir. Bu seçim, aşağıdaki nedenlere dayanmaktadır:

-   **Maliyet Etkinliği:** Düşük donanım maliyeti, projenin geniş ölçekte dağıtımını ekonomik olarak mümkün kılar.
-   **Performans:** Ağ ve yapay zeka işlemleri için yeterli işlem gücü ve bellek kapasitesi sunar.
-   **Geniş Ekosistem:** Geniş bir topluluk desteği ve aksesuar ekosistemine sahiptir.
-   **Düşük Güç Tüketimi:** 7/24 çalışacak bir cihaz için enerji verimliliği sağlar.

### 3.2. İşletim Sistemi

Temel işletim sistemi olarak **Raspberry Pi OS Lite (Debian Bookworm)** seçilmiştir. Bu seçimin temel nedenleri şunlardır:

-   **Minimum Ayak İzi:** 2GB'den az depolama alanı kaplayan minimalist bir yapıya sahiptir.
-   **ARM64 Desteği:** Modern yazılım ve konteyner teknolojileri için tam ARM64 desteği sunar.
-   **Geniş Paket Ekosistemi:** Debian tabanlı olması, geniş bir yazılım paketi ekosistemine erişim sağlar.
-   **Konteyner Uyumluluğu:** Docker ve Podman gibi konteyner çalışma zamanları ile tam uyumludur.

İşletim sistemi, Zram sıkıştırması, SSD/NVMe desteği ve read-only dosya sistemi gibi optimizasyonlarla daha da güçlendirilerek hem performans hem de güvenlik açısından sertleştirilecektir.

## 4. Yazılım Bileşenleri (HECS Agent)

HECS ajanının tüm işlevselliği, birbirinden izole edilmiş ve bağımsız olarak güncellenebilen Docker konteynerleri içinde çalışacak modüler servisler tarafından sağlanır.

| Konteyner Adı | Dil/Teknoloji | Görevi | Temel Özellikleri |
| :--- | :--- | :--- | :--- |
| **SecureEdgeGateway** | Go + Rust | Güvenli uzaktan erişim ve ağ kontrolü. | SSH bastion host, WireGuard tünelleme, DPI seviyesinde trafik analizi, Zero-Trust mimarisi. |
| **AutoUpdateDaemon** | Rust | GitOps tabanlı otomatik güncelleme. | Merkezi Git deposundan imza kontrollü delta güncellemeler, atomik dağıtım, otomatik geri alma (rollback). |
| **TaskOrchestrator** | Python + Go | Merkezi panelden gönderilen görevleri yürütme. | JSON-RPC 2.0 ile görev tanımı, Cron ve olay tabanlı tetikleme, güvenli ve kaynakları sınırlı çalışma. |
| **LocalAICache** | Python (FastAPI) | Yerel yapay zeka ve bilgi tabanı yönetimi. | TinyLLM (3-7B parametre) modelleri, RAG mimarisi, genel ve özel bilgi tabanları, gizlilik odaklı tasarım. |
| **Edge UI** | React + FastAPI | Cihaz yönetimi için yerel web arayüzü. | Profil yönetimi, ağ durumu izleme, güncelleme kontrolü, rapor oluşturma, AD/LDAP entegrasyonu. |

## 5. Güvenlik Mimarisi

HECS, "güvenlik öncelikli" (security-first) bir yaklaşımla tasarlanmıştır ve çok katmanlı bir güvenlik mimarisi kullanır.

-   **Ağ Güvenliği (Katman 1):** Tüm bulut trafiği **WireGuard VPN** tünelleri üzerinden şifrelenir. Cihaz üzerindeki güvenlik duvarı (firewall) kuralları, sadece beyaz listeye (whitelist) alınmış trafiğe izin verir ve DDoS saldırılarına karşı hız sınırlama (rate limiting) mekanizmaları bulunur.

-   **Uygulama Güvenliği (Katman 2):** Servisler arası iletişim, karşılıklı TLS (mTLS) ve sertifika sabitleme (certificate pinning) ile güvence altına alınır. API'ler, OAuth2 ve PKCE standartları ile korunur. SQL enjeksiyonu gibi zafiyetlere karşı parametreli sorgular kullanılır.

-   **Veri Güvenliği (Katman 3):** Tüm veriler hem bekleme durumunda (**AES-256**) hem de aktarım sırasında (**TLS 1.3**) şifrelenir. Hassas veriler için uçtan uca şifreleme uygulanır ve şifreleme anahtarları için HSM (Hardware Security Module) entegrasyonu hazırdır. Tüm işlemler, değiştirilemez denetim kayıtlarına (audit logs) kaydedilir.

## 6. Dağıtım ve Operasyonlar (GitOps)

HECS, güncellemelerin ve dağıtımların yönetimi için modern bir **GitOps** yaklaşımını benimser. Bu yaklaşım, tüm sistem yapılandırmasının ve uygulama kodunun bir Git deposunda tutulmasını ve tüm değişikliklerin bu depo üzerinden yönetilmesini içerir.

-   **Otomatik Güncelleme Süreci:**
    1.  Her HECS ajanı, `stable` veya `beta` gibi atandığı kanalı günde bir kez (genellikle gece saatlerinde) merkezi Git deposundan kontrol eder.
    2.  Yeni bir sürüm varsa, sürümün GPG imzasını ve bütünlüğünü doğrular.
    3.  Güncelleme öncesi sistem sağlık kontrollerini (disk alanı, CPU kullanımı vb.) yapar.
    4.  Yeni konteyner imajlarını indirir ve servisleri kesintisiz bir şekilde yeniden başlatır.
    5.  Güncelleme sonrası doğrulama testlerini çalıştırır ve durumu merkezi kontrol paneline raporlar.
-   **Geri Alma (Rollback):** Bir güncelleme başarısız olursa veya bir sorun tespit edilirse, sistem otomatik olarak önceki kararlı sürüme geri dönebilir. Bu, sistemin kararlılığını ve güvenilirliğini önemli ölçüde artırır.

## 7. Teknik Risk Analizi ve Azaltma Stratejileri

| Risk | Potansiyel Etki | Azaltma Stratejisi |
| :--- | :--- | :--- |
| **OTA Güncelleme Hatası (Bricking)** | Cihazın kullanılamaz hale gelmesi, saha ziyareti gerektirmesi. | **A/B Partisyonlama:** İşletim sistemini iki ayrı bölümde tutarak, güncellemeyi pasif bölüme uygulamak ve başarılı olursa aktif hale getirmek. Başarısızlık durumunda eski bölüme anında geri dönmek. **Güvenli Rollback:** Başarısız güncellemelerden sonra cihazın otomatik olarak son kararlı duruma dönmesini sağlayan mekanizmalar. |
| **Yanlış Ağ Yapılandırması** | Müşteri ağında kesintilere veya güvenlik zafiyetlerine neden olma. | **Doğrulama Testleri ve Dry-Run Modu:** Policy-routing gibi karmaşık ağ kurallarını uygulamadan önce, yapılandırmanın doğruluğunu kontrol eden otomatik testler ve değişiklikleri uygulamadan simüle eden bir "dry-run" modu. |
| **Raspberry Pi Performans Sınırları** | Yoğun ağ trafiği veya yapay zeka işlemleri altında sistemin yavaşlaması veya yanıt vermemesi. | **Geri Basınç (Back-Pressure) ve Örnekleme:** Sistemin aşırı yüklenmesini önlemek için gelen istekleri yavaşlatan (geri basınç) mekanizmalar. Ağ izleme ve AI işlemleri için veri toplama sıklığını dinamik olarak ayarlayan örnekleme algoritmaları. |
| **Tedarik Zinciri Saldırıları** | Güncelleme paketlerine veya konteyner imajlarına kötü amaçlı kod eklenmesi. | **İmzalı Varlıklar ve SBOM:** Tüm yazılım bileşenlerinin (konteyner imajları, deb paketleri) Sigstore/cosign gibi araçlarla dijital olarak imzalanması. Her sürüm için bir Yazılım Malzeme Listesi (SBOM) oluşturarak kullanılan tüm kütüphanelerin ve bağımlılıkların şeffaf bir şekilde belgelenmesi ve CI/CD hattında sürekli zafiyet taraması yapılması. |

## 8. Sonuç

HECS projesi, teknik olarak son derece sağlam ve iyi düşünülmüş bir temele sahiptir. Teknoloji seçimleri (Raspberry Pi, Debian, Docker, Go, Rust) modern, olgun ve proje hedefleriyle uyumludur. Önerilen modüler ve konteyner tabanlı mimari, esneklik, ölçeklenebilirlik ve bakım kolaylığı sağlar. GitOps tabanlı dağıtım modeli ve çok katmanlı güvenlik yaklaşımı, projenin operasyonel olarak verimli ve güvenli olacağını göstermektedir. Belirlenen teknik riskler tanımlanmış ve bu riskleri en aza indirecek etkili azaltma stratejileri ortaya konmuştur. Sonuç olarak, HECS projesi teknik açıdan **yapılabilir** ve başarılı bir şekilde hayata geçirilmesi için gerekli tüm teknik ön koşullara sahiptir.

---

## Referanslar

[1] Toplantı Raporu 1: Project Synapse (Haguenau Pro Edge Intelligence Node) - [https://docs.google.com/document/d/1QBLuoZf9NiReuXbRLPhC3QuN_BrUoyJXD3BLaYK8JJA/edit](https://docs.google.com/document/d/1QBLuoZf9NiReuXbRLPhC3QuN_BrUoyJXD3BLaYK8JJA/edit)
[2] Toplantı Raporu 2: Haguenau Edge Control System (HECS) - Teknik Mimari, İş Modeli ve Rekabetçi Stratejisi - [https://docs.google.com/document/d/16T8MOzVKW5tUlfmfUbyu59ogvx5GHutsQCI8kwTKF9w/edit](https://docs.google.com/document/d/16T8MOzVKW5tUlfmfUbyu59ogvx5GHutsQCI8kwTKF9w/edit)
[3] Toplantı Raporu 3: Teknik Uygulama Detayları - [https://docs.google.com/document/d/1YFyCX7LdT1U0ifwCaA7RpZ2SsL4zB5LNHR3AChLd0f0/edit](https://docs.google.com/document/d/1YFyCX7LdT1U0ifwCaA7RpZ2SsL4zB5LNHR3AChLd0f0/edit)
