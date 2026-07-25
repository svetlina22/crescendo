export async function renderAboutPage() {
  return `
    <section class="container py-5">
      <div class="row">
        <div class="col-lg-8 mx-auto">
          <h1 class="display-6 mb-4">За списание Crescendo</h1>
          <p class="lead text-secondary mb-5">
            Академична платформа за музикално образование — пространство за
            научен диалог, споделяне на практики и редакционна отговорност.
          </p>

          <section class="mb-5" aria-labelledby="missionHeading">
            <h2 class="h4 mb-3" id="missionHeading">Мисия и обхват</h2>
            <p>
              Crescendo публикува междисциплинарни изследвания, научни анализи и
              академични разработки в областта на музикалното образование. Целта
              ни е да свържем изследователи, педагози и институции около
              доказателствено обосновани подходи, политики и педагогически
              практики.
            </p>
            <p class="mb-0">
              Обхватът включва когнитивни и социални ползи от музиката,
              образователни политики, методически модели, социални програми
              (вкл. El Sistema) и академичен резонанс от събития и публикации.
            </p>
          </section>

          <section class="mb-5" aria-labelledby="boardHeading">
            <h2 class="h4 mb-3" id="boardHeading">Редакционна колегия</h2>
            <div class="row g-3">
              <div class="col-md-4">
                <div class="border rounded-3 p-3 h-100 bg-white">
                  <p class="small text-uppercase text-secondary fw-semibold mb-2">
                    Главен редактор
                  </p>
                  <p class="fw-semibold mb-1">проф. д-р Мария Иванова</p>
                  <p class="small text-secondary mb-0">
                    Национална музикална академия „Проф. Панчо Владигеров“
                  </p>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded-3 p-3 h-100 bg-white">
                  <p class="small text-uppercase text-secondary fw-semibold mb-2">
                    Редакционен съвет
                  </p>
                  <ul class="small mb-0 ps-3">
                    <li class="mb-2">
                      <span class="fw-semibold">доц. д-р Елена Георгиева</span><br />
                      <span class="text-secondary">СУ „Св. Климент Охридски“</span>
                    </li>
                    <li>
                      <span class="fw-semibold">гл. ас. д-р Петър Петров</span><br />
                      <span class="text-secondary">АМТИИ „Проф. Асен Диамандиев“</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded-3 p-3 h-100 bg-white">
                  <p class="small text-uppercase text-secondary fw-semibold mb-2">
                    Рецензенти
                  </p>
                  <p class="small text-secondary mb-0">
                    Рецензентският състав включва независими академични експерти
                    по музикална педагогика, образователни политики и
                    изпълнителско изкуство. Конкретните рецензенти се назначават
                    за всеки ръкопис при спазване на анонимност и конфликт на
                    интереси.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section class="mb-5" aria-labelledby="authorsHeading">
            <h2 class="h4 mb-3" id="authorsHeading">Насоки за автори</h2>
            <p>
              Ръкописите се изпращат чрез авторския панел на платформата.
              Материалите преминават редакционен преглед (статус „За преглед“) и
              се публикуват след одобрение от администратор/редактор.
            </p>
            <ul class="mb-3">
              <li>
                <strong>Формат:</strong> заглавие, резюме (abstract), основен
                текст; ясен академичен стил на български език.
              </li>
              <li>
                <strong>Структура:</strong> въведение, аргументация/метод,
                резултати или анализ, заключение и библиографски препратки.
              </li>
              <li>
                <strong>Етика:</strong> оригиналност на текста, коректно
                цитиране, прозрачност при конфликт на интереси и забрана за
                паралелно подаване към друго издание без уведомление.
              </li>
              <li>
                <strong>Метаданни:</strong> избор на рубрика, ръчен URL slug и
                подходящи тагове за откриваемост.
              </li>
            </ul>
            <p class="mb-0">
              Авторите запазват правото върху съдържанието; Crescendo си запазва
              правото на езикова и структурна редакция преди публикация.
            </p>
          </section>

          <section class="mb-0" aria-labelledby="contactsHeading">
            <h2 class="h4 mb-3" id="contactsHeading">Контакти</h2>
            <dl class="row mb-0">
              <dt class="col-sm-3 text-secondary">Имейл</dt>
              <dd class="col-sm-9">
                <a href="mailto:redakcia@crescendo.bg">redakcia@crescendo.bg</a>
              </dd>
              <dt class="col-sm-3 text-secondary">Адрес</dt>
              <dd class="col-sm-9 mb-0">
                бул. „Евлоги и Христо Георгиеви“ 94<br />
                1505 София, България
              </dd>
            </dl>
          </section>
        </div>
      </div>
    </section>
  `;
}
