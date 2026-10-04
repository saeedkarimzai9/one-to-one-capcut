const panels={media:{title:"Media",items:["Import videos","Import images","Recent media","Stock placeholders"]},audio:{title:"Audio",items:["Music","Sound effects","Voiceover","Extract audio"]},text:{title:"Text",items:["Add text","Text templates","Auto captions","Font styles"]},stickers:{title:"Stickers",items:["Emoji","Meme","Gaming","Shapes"]},effects:{title:"Effects",items:["Glitch","Shake","Glow","VHS","Flash","Blur"]},filters:{title:"Filters",items:["Original","Cinema","Retro","Cool","Warm","B&W"]},transitions:{title:"Transitions",items:["Fade","Slide","Zoom","Spin","Flash"]},captions:{title:"Captions",items:["Auto captions","Caption styles","Highlight words","Karaoke"]},adjust:{title:"Adjust",items:["Brightness","Contrast","Saturation","Sharpness","Temperature"]}};

const tools=document.querySelectorAll(".tool"),panelTitle=document.querySelector("#panelTitle"),content=document.querySelector("#panelContent");
const fileInput=document.querySelector("#fileInput"),importBtn=document.querySelector("#importBtn"),video=document.querySelector("#video"),empty=document.querySelector("#emptyPreview"),play=document.querySelector("#play"),time=document.querySelector("#time"),duration=document.querySelector("#duration"),projectTime=document.querySelector("#projectTime"),videoTrack=document.querySelector("#videoTrack"),audioTrack=document.querySelector("#audioTrack"),textTrack=document.querySelector("#textTrack"),overlayText=document.querySelector("#overlayText"),clipInfo=document.querySelector(".inspector .clip-info");
let sourcePath="",sourceDuration=0,segments=[],activeSegment=null;

function renderPanel(name){
  const p=panels[name]; panelTitle.textContent=p.title; content.innerHTML="";
  if(name==="stickers"){
    const emojis=["😀","😂","😎","😭","💀","🔥","❤️","💯","👀","🤯","⭐","✨","💥","🎉","🎮","👑","🚀","💎","🗿","🤣","😱","🥶","😈","🤡"];
    const g=document.createElement("div");g.className="emoji-grid";
    emojis.forEach(e=>{const b=document.createElement("div");b.className="emoji";b.textContent=e;b.onclick=()=>addSticker(e);g.appendChild(b)});
    content.appendChild(g);return;
  }
  p.items.forEach(x=>{const d=document.createElement("div");d.className="asset-card";d.textContent=x;d.onclick=()=>action(name,x);content.appendChild(d)});
}
function action(panel,item){
  if(panel==="text"&&item==="Add text"){const t=prompt("Enter text");if(t)addText(t)}
  else if(panel==="media"&&item.startsWith("Import"))fileInput.click();
  else if(panel==="audio"&&item==="Voiceover")alert("Voiceover recording is planned for the next build.");
  else alert(item+" is ready for the next editing module.");
}
function addText(t){overlayText.textContent=t;const c=document.createElement("div");c.className="clip text";c.textContent=t;textTrack.appendChild(c)}
function addSticker(e){overlayText.textContent=e;const c=document.createElement("div");c.className="clip text";c.textContent=e;textTrack.appendChild(c)}
tools.forEach(t=>t.onclick=()=>{tools.forEach(x=>x.classList.remove("active"));t.classList.add("active");renderPanel(t.dataset.panel)});

importBtn.onclick=()=>fileInput.click();
fileInput.onchange=()=>{
  [...fileInput.files].forEach(file=>{
    const url=URL.createObjectURL(file),c=document.createElement("div");
    c.className="clip "+(file.type.startsWith("audio")?"audio":"video");c.textContent=file.name;
    (file.type.startsWith("audio")?audioTrack:videoTrack).appendChild(c);
    if(file.type.startsWith("video")){
      sourcePath=window.systemEdit.getFilePath(file);
      video.src=url;empty.style.display="none";video.load();
      video.onloadedmetadata=()=>{
        sourceDuration=video.duration;
        segments=[{start:0,end:sourceDuration,label:file.name}];
        activeSegment=segments[0];duration.textContent=fmt(sourceDuration);
        renderVideoSegments();
        updateClipInfo();
        projectTime.textContent="00:00 / "+fmt(sourceDuration);
      };
    }
  });
};

function renderVideoSegments(){
  videoTrack.innerHTML="";
  segments.forEach((seg,i)=>{
    const c=document.createElement("div");c.className="clip video";c.textContent=(i+1)+". "+seg.label;
    const width=Math.max(80,(seg.end-seg.start)/Math.max(sourceDuration,1)*100);
    c.style.left=(seg.start/Math.max(sourceDuration,1)*100)+"%";c.style.width=width+"%";
    c.onclick=()=>selectSegment(i);videoTrack.appendChild(c);
  });
}
function selectSegment(i){
  activeSegment=segments[i];video.currentTime=activeSegment.start;updateClipInfo();
}
function updateClipInfo(){
  if(!activeSegment){clipInfo.textContent="Import a video to begin.";return}
  clipInfo.textContent="Selected: "+fmt(activeSegment.start)+" → "+fmt(activeSegment.end)+" ("+fmt(activeSegment.end-activeSegment.start)+")";
}
function splitAtPlayhead(){
  if(!activeSegment){alert("Import a video first.");return}
  const t=video.currentTime;
  if(t<=activeSegment.start+0.05||t>=activeSegment.end-0.05){alert("Move the playhead inside the selected clip before splitting.");return}
  const index=segments.indexOf(activeSegment);
  const left={start:activeSegment.start,end:t,label:activeSegment.label+" A"};
  const right={start:t,end:activeSegment.end,label:activeSegment.label+" B"};
  segments.splice(index,1,left,right);activeSegment=right;renderVideoSegments();updateClipInfo();video.currentTime=t;
}
function duplicateSegment(){
  if(!activeSegment){alert("Select a video clip first.");return}
  const index=segments.indexOf(activeSegment);
  const copy={...activeSegment,label:activeSegment.label+" copy"};
  segments.splice(index+1,0,copy);renderVideoSegments();
}
document.querySelector(".wide-btn").onclick=splitAtPlayhead;
document.querySelectorAll(".wide-btn")[1].onclick=duplicateSegment;

play.onclick=()=>video.paused?video.play():video.pause();
video.onplay=()=>play.textContent="❚❚";video.onpause=()=>play.textContent="▶";
document.querySelector("#back5").onclick=()=>video.currentTime=Math.max(0,video.currentTime-5);
document.querySelector("#forward5").onclick=()=>video.currentTime=Math.min(sourceDuration,video.currentTime+5);
document.querySelector("#speed").onchange=e=>video.playbackRate=Number(e.target.value);

function fmt(s){if(!isFinite(s))return"00:00";return String(Math.floor(s/60)).padStart(2,"0")+":"+String(Math.floor(s%60)).padStart(2,"0")}
video.ontimeupdate=()=>{
  time.textContent=fmt(video.currentTime);
  projectTime.textContent=fmt(video.currentTime)+" / "+fmt(video.duration);
  if(activeSegment&&video.currentTime>=activeSegment.end){video.pause();video.currentTime=activeSegment.start}
};
video.onloadedmetadata=()=>{duration.textContent=fmt(video.duration);projectTime.textContent="00:00 / "+fmt(video.duration)};

document.querySelector(".export").onclick=async()=>{
  if(!sourcePath||!activeSegment){alert("Import a video and select a clip first.");return}
  try{
    const result=await window.systemEdit.exportClip(sourcePath,activeSegment.start,activeSegment.end);
    if(!result.canceled) alert("Export complete!\nSaved to:\n"+result.path);
  }catch(err){alert("Export failed:\n"+err.message)}
};
document.querySelector("#addTrack").onclick=()=>alert("New timeline track created in the full desktop build.");
renderPanel("media");
